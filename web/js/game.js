let usermarker;
let actualmarker;
let markerlat;
let markerlng;
let pano_widget;
let image_id;
let round = 1;
const session_id = localStorage.getItem("session_id");

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("next_round_button").textContent="Next Round!";
    update_round(round);

    if (session_id) {
        axios.get(`/api/nextimage?session_id=${session_id}`)
            .then(response => {
                image_id = response.data.img_id;
                update_map(`/api/images/${image_id}`);
            });
    } else {
        console.log("No session id")
        update_map('./images/pano.jpg');
    }
});

function update_map(image_url) {
    if (pano_widget) {
        pano_widget.destroy();
    }
    // Replace panorama div with pannellum widget
    pano_widget = pannellum.viewer('panorama', {
        "type": "equirectangular",
        "panorama": `${image_url}`,
        "autoLoad": true
    });
}

function update_round(round) {
    document.getElementById("round-num").textContent=('Round ' + round);
    return void(0);
}

// Replace map div with leaflet map
let map = L.map('map').setView([35.906923, -79.047827], 13);


// Tile layer, attribution is required
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    minZoom: 15,
    // maxBounds: bounds,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);


function onMapClick(e) {
    // alert("You clicked the map at " + e.latlng);
    if (usermarker) {
        usermarker.remove();
    }
    usermarker = L.marker(e.latlng).addTo(map);
    markerlat = e.latlng.lat;
    markerlng = e.latlng.lng;
    // console.log(markerlat);
    // console.log(markerlong);
    document.getElementById("submit_button").removeAttribute("disabled");
}

map.on('click', onMapClick);

document.getElementById("submit_button").addEventListener("click", function () {
    document.getElementById("next_round_button").removeAttribute("disabled");
    axios.get(`/api/getscore?img_id=${image_id}&lat=${markerlat}&long=${markerlng}&session_id=${session_id}`)
        .then(response => {
            round_results(response.data.score,response.data.location);
        })
});

function round_results(score, location) {
    document.getElementById("results").style.visibility = "initial";
    document.getElementById("results_text").textContent=('Points ' + score);
    actualmarker  = L.marker(L.latLng(location.lat, location.long)).addTo(map);
    if (round === 5) {
        document.getElementById("next_round_button").textContent="Finish Game";
    }
}

document.getElementById("next_round_button").addEventListener("click", function () {
    if (round === 5) {
        window.location.href = "results.html";
    } else {
        document.getElementById("next_round_button").setAttribute("disabled", "disabled");
        document.getElementById("submit_button").setAttribute("disabled", "disabled");
        round++;
        actualmarker.remove();
        usermarker.remove();
        update_round(round);
        document.getElementById("results").style.visibility = "hidden";
        axios.get(`/api/nextimage?session_id=${session_id}`)
            .then(response => {
                image_id = response.data.img_id;
                update_map(`/api/images/${image_id}`);
            });
    }
});