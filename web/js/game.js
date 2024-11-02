let testmarker;
let markerlat;
let markerlng;
var corner1 = L.latLng(35.914674, -79.059586);
var corner2 = L.latLng(35.900953, -79.039877);
bounds = L.latLngBounds(corner1, corner2);

// Replace map div with
var map = L.map('map').setView([35.906923, -79.047827], 13);

// Replace panorama div with pannellum
pannellum.viewer('panorama', {
    "type": "equirectangular",
    "panorama": "./images/pano.jpg",
    "autoLoad": true
});

// Tile layer, attribution is required
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    minZoom: 15,
    maxBounds: bounds,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);


function onMapClick(e) {
    // alert("You clicked the map at " + e.latlng);
    if (testmarker) {
        testmarker.remove();
    }
    testmarker = L.marker(e.latlng).addTo(map);
    markerlat = e.latlng.lat;
    markerlng = e.latlng.lng;
    // console.log(markerlat);
    // console.log(markerlong);
}

map.on('click', onMapClick);