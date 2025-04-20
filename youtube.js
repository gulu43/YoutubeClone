import { KEY } from './API_KEY.js';

// Get elements
let leftMenuBtn = document.querySelector('#slid_btn');
let leftMenu = document.querySelector('#left_menu');
let bottomPart = document.querySelector('#bottom_part');
let trigger = 0;
// Toggle sidebar
leftMenuBtn.addEventListener('click', () => {
    leftMenu.classList.toggle('shrink');

    if (leftMenu.classList.contains('shrink')) {
        bottomPart.style.gridTemplateColumns = "90px 1fr"; // Sidebar shrinks
        // otheers code 4 videos
        left_menubar_3();
        fun_four_video();

    } else {
        bottomPart.style.gridTemplateColumns = "250px 1fr"; // Sidebar expands
        // other code 3 videos
        left_menu_big_4();
        fun_three_video();
    }
});

let videoCardContainer = document.getElementById("main_body_container");
let total_video_call = 21;

let channel_Id = [];
let channel_logo = {};

const video_https = "https://www.googleapis.com/youtube/v3/videos?";
let generateQueryParam = new URLSearchParams({
    key: KEY,
    part: "snippet, statistics, contentDetails",
    chart: "mostPopular",
    maxResults: total_video_call,
    // regionCode: "IN",
});

async function channel_logo_api() {
    const channel_Id = [];  

    let link = await fetch(video_https + generateQueryParam);
    let data = await link.json();
    data.items.forEach((e) => {
        // console.log(e.snippet.channelId);
        channel_Id.push(e.snippet.channelId);
    })

    if (!channel_Id.length) {
        console.warn("channel_Id array is empty. Skipping channel logo API.");
        return;
    }

    const channel_https = "https://www.googleapis.com/youtube/v3/channels?";
    let generateQueryParam_for_channel = new URLSearchParams({
        key: KEY,
        part: "snippet",
        id: channel_Id.join(",")
    });

    let link_channel = await fetch(channel_https + generateQueryParam_for_channel);
    let channel_data = await link_channel.json();
    
    if (!channel_data.items) {
        console.error("No channel data returned:", channel_data);
        return;
    }

    channel_data.items.forEach((e) => {
        channel_logo[e.id] = e.snippet.thumbnails.default.url;
        // console.log(e.id,e.snippet.thumbnails.default.url);
    })
}

// channel_logo_api();
// console.log(channel_Id);
// console.log(channel_logo);

 let searchVar = document.querySelector('#search');
 let sIconVar = document.querySelector('#s_icon');
 sIconVar.addEventListener('click',async (e)=>{

    let string = searchVar.value;
    console.log('check if ',searchVar.value);
    
    search_fn(searchVar.value);
    trigger = 1;    

     // Instead of just calling search_fn, trigger full render:
     if (leftMenu.classList.contains('shrink')) {
        await fun_four_video(); // call appropriate video rendering function
    } else {
        await fun_three_video();
    }
 })

 
// console.log('after param string val check -> ',string);

async function search_fn(searchString) {
    const channel_Id = []; 

    let generateQueryParamSearch = new URLSearchParams({
        key: KEY,
        part: "snippet",
        q: searchString,           
        type: "video",            
        maxResults: total_video_call
    });

    let link = await fetch("https://www.googleapis.com/youtube/v3/search?" + generateQueryParamSearch);
    let data = await link.json();
    console.log('data new->',data);
    
    data.items.forEach((e) => {
        // console.log(e.snippet.channelId);
        channel_Id.push(e.snippet.channelId);
    })

    if (!channel_Id.length) {
        console.warn("channel_Id array is empty. Skipping channel logo API.");
        return;
    }

    const channel_https = "https://www.googleapis.com/youtube/v3/channels?";
    let generateQueryParam_for_channel = new URLSearchParams({
        key: KEY,
        part: "snippet",
        id: channel_Id.join(",")
    });

    let link_channel = await fetch(channel_https + generateQueryParam_for_channel);
    let channel_data = await link_channel.json();
    
    if (!channel_data.items) {
        console.error("No channel data returned:", channel_data);
        return;
    }

    channel_data.items.forEach((e) => {
        channel_logo[e.id] = e.snippet.thumbnails.default.url;
        // console.log(e.id,e.snippet.thumbnails.default.url);
    })
    
}

async function video_creater_fn(videoCardContainer, vData) {
    videoCardContainer.innerHTML = "";
    if (trigger === 0) {
        await channel_logo_api();
    }else{
        await search_fn(searchVar.value);
    }
    
    vData.items.forEach((e) => {
        let videoCard = document.createElement("div");
        videoCard.classList.add("video_card");
        // getting currect logo 
        let current_id = e.snippet.channelId;
        videoCard.innerHTML = `
            <div class="video_id">${e.id.videoId}</div>
            <div class="video_thumbnail_div"><img class="video_thumbnail" src="${e.snippet.thumbnails.medium.url}" alt="Thumbnail"> 
            <div class="video_time"> ${convertDuration(e.contentDetails?.duration || 'empty')}</div> </div>
            <div class="bottom_part_in">

            <div class="left_part">
            <div class="channel_logo_div">
            <img class="channel_logo" src="${channel_logo[current_id]}" alt="channel_logo"></div>
            </div>

            <div class="right_part">
            <div class="video_title">${e.snippet?.localized?.title || e.snippet?.title || 'Title not available'}</div>
            <div class="video_channel">${e.snippet.channelTitle}</div>
            <div class="video_Views_PublishedAtCount">
            <div class="video_views">${formatViews(e.statistics?.viewCount || 'NoviewCount')}</div> * <div class="video_publishedAt">${timeAgo(e.snippet.publishedAt)}</div> </div>
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
    
    let videos_link = {};
    if (trigger === 0) {
        videos_link = await fetch(video_https + generateQueryParam);        
    } else {
        let newSearchParams = new URLSearchParams({
            key: KEY,
            part: "snippet",
            q: searchVar.value,
            type: "video",
            maxResults: total_video_call
        });
        let search_url = "https://www.googleapis.com/youtube/v3/search?" + newSearchParams;
        videos_link = await fetch(search_url);
    }
    
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

    let videos_link = {};

    if (trigger === 0) {
        videos_link = await fetch(video_https + generateQueryParam);        
    } else {
        let newSearchParams = new URLSearchParams({
            key: KEY,
            part: "snippet",
            q: searchVar.value,
            type: "video",
            maxResults: total_video_call
        });
        let search_url = "https://www.googleapis.com/youtube/v3/search?" + newSearchParams;
        videos_link = await fetch(search_url);
    }

    let data = await videos_link.json();
    console.log(data);
    video_creater_fn(videoCardContainer, data);

}

function convertDuration(duration) {
    const match = duration && duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

    if (!match) return "0:00"; // safe fallback

    const hours = match[1] ? parseInt(match[1].replace('H', '')) : 0;
    const minutes = match[2] ? parseInt(match[2].replace('M', '')) : 0;
    const seconds = match[3] ? parseInt(match[3].replace('S', '')) : 0;

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

// leftmenu bar

function left_menubar_3() {
    
    let left_menu_var = document.querySelector('#left_menu');
    left_menu_var.innerHTML="";
    left_menu_var.classList.toggle('left_menu_class');
    left_menu_var.innerHTML=`
        <div class="home_div flex_column_class "  >
            <span class="material-symbols-outlined">home</span>
            <div class="stxt">Home</div>
        </div>

         <div class="home_div flex_column_class "  >
            <span class="material-symbols-outlined">play_arrow</span>
            <div class="stxt">Shorts</div>
         </div>

        <div class="home_div flex_column_class "  >
            <span class="material-symbols-outlined">subscriptions</span>
            <div class="stxt">Subscriptions</div>
        </div>

        <div class="home_div flex_column_class "  >
            <span class="material-symbols-outlined">account_circle</span>
            <div class="stxt">You</div>
        </div>   
    `
    // bottom_partVar.appendChild(left_menu_var);
}

function left_menu_big_4() {
    let left_menu_var = document.querySelector('#left_menu');
    left_menu_var.innerHTML="";
    left_menu_var.classList.toggle('four_class');
    left_menu_var.innerHTML=`
         <div id="left_menu_home_comp" class="cont_left_menu selected" >
                    <div class="material-symbols-outlined icon">home</div> <div class="txt">Home</div>
                </div>
                <div  class="cont_left_menu" >
                    <div class="material-symbols-outlined icon">play_arrow</div> <div class="txt">shorts</div>
                </div>
                <div  class="cont_left_menu" >
                    <div class="material-symbols-outlined icon">subscriptions</div> <div class="txt">Subscriptions</div>
                </div>

                <hr class="line">

                <div style="margin-bottom: 15px;">
                    <span style="font-size: 16px;"> You</span> <span style="padding-left: 10px;">></span>
                </div>

                <div  class="cont_left_menu" >
                    <div class="material-symbols-outlined icon">history</div> <div class="txt">History</div>
                </div>

                <div  class="cont_left_menu" >
                    <div class="material-symbols-outlined icon">format_list_bulleted_add</div> <div class="txt">Playlists</div>
                </div>

                <div  class="cont_left_menu" >
                    <div class="material-symbols-outlined icon">smart_display</div> <div class="txt">Your videos</div>
                </div>

                <div  class="cont_left_menu" >
                    <div class="material-symbols-outlined icon">school</div> <div class="txt">Your courses</div>
                </div>

                <div  class="cont_left_menu" >
                    <div class="material-symbols-outlined icon">history_toggle_off</div> <div class="txt">Watch later</div>
                </div>

                <div  class="cont_left_menu" >
                    <div class="material-symbols-outlined icon">thumb_up</div> <div class="txt">liked videos</div>
                </div>

                <div  class="cont_left_menu" >
                    <div class="material-symbols-outlined icon">content_cut</div> <div class="txt">Your clips</div>
                </div>
    `;
}

document.addEventListener("DOMContentLoaded", () => {
    fun_three_video();
    // fun_four_video(); 
});

videoCardContainer.addEventListener('click', (e) => {
    let videoCard = e.target.closest('.video_card');
    if (videoCard) {
        // Extract the videoId from the video card
        let videoId = videoCard.querySelector('.video_id').textContent;
        console.log(videoId);  // Log the videoId to verify

        // Redirect to the video page with the videoId as a query parameter
        window.location.href = `video.html?id=${videoId}`;
    }
});

