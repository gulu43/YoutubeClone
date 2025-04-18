import { KEY } from './API_KEY.js';

// Get elements
let leftMenuBtn = document.querySelector('#slid_btn');
let leftMenu = document.querySelector('#left_menu');
let bottomPart = document.querySelector('#bottom_part');

// Toggle sidebar
leftMenuBtn.addEventListener('click', () => {
    leftMenu.classList.toggle('shrink');

    if (leftMenu.classList.contains('shrink')) {
        bottomPart.style.gridTemplateColumns = "90px 1fr"; // Sidebar shrinks
        // otheers code 4 videos
        fun_four_video();

    } else {
        bottomPart.style.gridTemplateColumns = "250px 1fr"; // Sidebar expands
        // other code 3 videos
        fun_three_video();
    }
});

let videoCardContainer = document.getElementById("main_body_container");
let total_video_call = 12;

let channel_Id = [];
let channel_logo = {};

const video_https = "https://www.googleapis.com/youtube/v3/videos?";
let generateQueryParam = new URLSearchParams({
    key: KEY,
    part: "snippet, statistics, contentDetails",
    chart: "mostPopular",
    maxResults: total_video_call,
    regionCode: "IN",
});

async function channel_logo_api() {
    let link = await fetch(video_https + generateQueryParam);
    let data = await link.json();
    data.items.forEach((e) => {
        // console.log(e.snippet.channelId);
        channel_Id.push(e.snippet.channelId);
    })

    const channel_https = "https://www.googleapis.com/youtube/v3/channels?";
    let generateQueryParam_for_channel = new URLSearchParams({
        key: KEY,
        part: "snippet",
        id: channel_Id.join(",")
    });

    let link_channel = await fetch(channel_https + generateQueryParam_for_channel);
    let channel_data = await link_channel.json();
    console.log(channel_data);

    channel_data.items.forEach((e) => {
        channel_logo[e.id] = e.snippet.thumbnails.default.url;
        // console.log(e.id,e.snippet.thumbnails.default.url);
    })
}

// channel_logo_api();
// console.log(channel_Id);
// console.log(channel_logo);


async function video_creater_fn(videoCardContainer, vData) {
    videoCardContainer.innerHTML = "";
    await channel_logo_api();
    vData.items.forEach((e) => {
        let videoCard = document.createElement("div");
        videoCard.classList.add("video_card");
        // getting currect logo 
        let current_id = e.snippet.channelId;
        videoCard.innerHTML = `
            <div class="video_id">${e.id}</div>
            <div class="video_thumbnail_div"><img class="video_thumbnail" src="${e.snippet.thumbnails.medium.url}" alt="Thumbnail"> 
            <div class="video_time"> ${convertDuration(e.contentDetails.duration)}</div> </div>
            <div class="bottom_part_in">

            <div class="left_part">
            <div class="channel_logo_div">
            <img class="channel_logo" src="${channel_logo[current_id]}" alt="channel_logo"></div>
            </div>

            <div class="right_part">
            <div class="video_title">${e.snippet.localized.title}</div>
            <div class="video_channel">${e.snippet.channelTitle}</div>
            <div class="video_Views_PublishedAtCount">
            <div class="video_views">${formatViews(e.statistics.viewCount)}</div> * <div class="video_publishedAt">${timeAgo(e.snippet.publishedAt)}</div> </div>
            </div>  

            <div class="dot_cont">
            <div class="material-symbols-outlined">more_vert</div>
            </div>

            </div>
        `;

        videoCardContainer.appendChild(videoCard);

    });
}

async function fun_three_video() {
    videoCardContainer.style.display = 'grid';
    videoCardContainer.style.gridTemplateColumns = '1fr 1fr 1fr';
    videoCardContainer.style.gridTemplateRows = `repeat(${Math.ceil(total_video_call / 3)}, 330px)`;
    videoCardContainer.style.columnGap = '15px';
    videoCardContainer.style.rowGap = '30px';

    let videos_link = await fetch(video_https + generateQueryParam);
    let data = await videos_link.json();
    console.log(data);
    video_creater_fn(videoCardContainer, data);

}

async function fun_four_video() {
    videoCardContainer.style.display = 'grid';
    videoCardContainer.style.gridTemplateColumns = '1fr 1fr 1fr 1fr';
    videoCardContainer.style.gridTemplateRows = `repeat(${Math.ceil(total_video_call / 4)}, 290px)`;
    videoCardContainer.style.columnGap = '15px';
    videoCardContainer.style.rowGap = '30px';

    let videos_link = await fetch(video_https + generateQueryParam);
    let data = await videos_link.json();
    console.log(data);
    video_creater_fn(videoCardContainer, data);

}

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

document.addEventListener("DOMContentLoaded", () => {
    fun_three_video();
    // fun_four_video(); 
});

videoCardContainer.addEventListener('click', (e)=>{
    let videoCard = e.target.closest('.video_card');
    let globleId = '';
    if (videoCard) {
        let videoId = videoCard.querySelector('.video_id').textContent ;
        globleId = videoId;
        console.log(videoId);
        window.location.href=`video.html?id=${videoId}`;
    }
})
