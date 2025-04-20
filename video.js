import { KEY } from './API_KEY.js';

const urlParams = new URLSearchParams(window.location.search);
const videoId = urlParams.get("id");
console.log('id->',videoId);

const videoPlayerContainer = document.querySelector("#main_cont_with_filter");
const video_http = "https://www.googleapis.com/youtube/v3/videos?";

let param = new URLSearchParams({
    key: KEY,
    part: "snippet",
    id: videoId
})
// console.log(data);

if (videoId) {
    fetch(video_http + param)
        .then((res) => res.json())
        .then((data) => {
            if (data.items && data.items.length > 0) {
                videoPlayerContainer.innerHTML = "";
                videoPlayerContainer.innerHTML = `
                    <iframe class="ifram_con" width="100%" height="100%" class="ifram_con" 
                        src="https://www.youtube.com/embed/${videoId}" 
                        frameborder="0" 
                        allowfullscreen>
                    </iframe>
                `;
            } else {
                videoPlayerContainer.innerHTML = `<p>Video not found</p>`;
            }
        })
        .catch((err) => console.error("Error fetching video details:", err));
}
    // right 
    rightSide_fn();
    // ok
    discription()






async function rightSide_fn() {
    // right side video code
    let right_menu_var = document.getElementById('right_menu');
    let generateQueryParam = new URLSearchParams({
        key: KEY,
        part: "snippet, statistics, contentDetails",
        chart: "mostPopular",
        maxResults: 10,
        regionCode: "IN",
    });

    let urlData = await fetch(video_http+generateQueryParam);
    let data = await urlData.json();
    console.log(data);

    right_menu_var.innerHTML = ""; // Clear previous cards

    data.items.forEach((video) => {
        let card_Cont = document.createElement('div');
        card_Cont.classList.add('card_const_class');
        card_Cont.innerHTML = `
        <div class="img_cont_left">
            <img class="imgs" src='${video.snippet.thumbnails.medium.url}'>
            <div class="time_vd"> ${convertDuration(video.contentDetails.duration)}</div> 
        </div>
        <div class="txt_right">
            <div class="title">${video.snippet.localized.title}</div>    
            <div class="channel_name">${video.snippet.channelTitle}</div>    
            <div class="views_ago_cont">
                <div class="views_vd">${formatViews(video.statistics.viewCount)}</div> * 
                <div class="ago_vd">${timeAgo(video.snippet.publishedAt)}</div>
            </div>    
        </div>
        <div class="dots">
            <div class="material-symbols-outlined">more_vert</div> 
        </div>
        `;
        right_menu_var.appendChild(card_Cont);
    });
}



async function discription() {
    const data = await getVideoDetails(videoId);
    console.log("this", data.views);
    console.log('ok', data);

    let cont_var = document.createElement('div');

    cont_var.innerHTML = `
        <div class="title_section">
            <h1>${data.title}</h1>
        </div>
        <div class="info_buttons_section">
            <div class="channel_info">
                <img class="channel_icon" src="${data.channelLogo}" />
                <div class="channel_name">
                    <div>${data.channelName}</div>
                    <div>${data.subscribers} subscribers</div>
                </div>
                <button class="subscribe_btn">Subscribe</button>
            </div>
            <div class="action_buttons">
                <button class="like_button">
                    <div class="thumb_icon material-symbols-outlined">thumb_up</div>
                    <div class="like_count">${data.likes}</div>
                </button>
                <button class="dislike_button">
                    <div class="icon">thumb_down</div>
                </button>
                <button class="share_button">
                    <div class="icon material-symbols-outlined">share</div>
                    <div class="label">Share</div>
                </button>
                <button class="download_button">
                    <div class="icon material-symbols-outlined">download</div>
                    <div class="label">Download</div>
                </button>
                <button class="more_button">
                    <div class="icon material-symbols-outlined">more_horiz</div>
                </button>
            </div>
        </div>
        <div class="video_description">
            <div class="video_stats">
                <div>${data.views} views</div>
                <div>${data.uploadDate}</div>
            </div>
            <div class="social">
                <div>${data.description}</div>
            </div>
        </div>
    `;

    let video_inf_cont_var = document.getElementById('video_inf_cont');
    video_inf_cont_var.appendChild(cont_var);
}

async function getVideoDetails(videoId) {
    const videoParams = new URLSearchParams({
        key: KEY,
        part: "snippet,statistics,contentDetails",
        id: videoId
    });

    const videoRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?${videoParams}`);
    const videoData = await videoRes.json();
    const video = videoData.items[0];

    const channelId = video.snippet.channelId  ;

    const channelParams = new URLSearchParams({
        key: KEY,
        part: "snippet,statistics",
        id: channelId
    });

    const channelRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?${channelParams}`);
    const channelData = await channelRes.json();
    const channel = channelData.items[0];

    return {
        title: video.snippet.title,
        description: video.snippet.description,
        views: video.statistics.viewCount,
        likes: video.statistics.likeCount,
        uploadDate: video.snippet.publishedAt,
        channelName: video.snippet.channelTitle,
        channelLogo: channel.snippet.thumbnails.high.url,
        subscribers: channel.statistics.subscriberCount
    };
}   


// fun duretion
function convertDuration(duration) {
    let match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

    let hours = match[1] ? parseInt(match[1]) : 0;
    let minutes = match[2] ? parseInt(match[2]) : 0;
    let seconds = match[3] ? parseInt(match[3]) : 0;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Function to format views count (e.g., 1M views)
function formatViews(views) {
    if (views >= 1_000_000) return (views / 1_000_000).toFixed(1) + "M views";
    if (views >= 1_000) return (views / 1_000).toFixed(1) + "K views";
    return views + " views";
}

// Function to calculate "time ago" from ISO date
function timeAgo(dateString) {
    let now = new Date();
    let past = new Date(dateString);
    let diff = Math.floor((now - past) / 1000); // Difference in seconds

    let units = [
        { label: "year", seconds: 31536000 },
        { label: "month", seconds: 2592000 },
        { label: "week", seconds: 604800 },
        { label: "day", seconds: 86400 },
        { label: "hour", seconds: 3600 },
        { label: "minute", seconds: 60 },
    ];

    for (let unit of units) {
        let interval = Math.floor(diff / unit.seconds);
        if (interval >= 1) {
            return `${interval} ${unit.label}${interval > 1 ? "s" : ""} ago`;
        }
    }
    return "Just now";

}


