var map = L.map('map').setView([35.906923, -79.047827], 13);

var corner1 = L.latLng(35.914674, -79.059586);
var corner2 = L.latLng(35.900953, -79.039877);
bounds = L.latLngBounds(corner1, corner2);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    minZoom: 15,
    maxBounds: bounds,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

let testmarker;
function onMapClick(e) {
    // alert("You clicked the map at " + e.latlng);
    if (testmarker) {
        testmarker.remove();
    }
    testmarker = L.marker(e.latlng).addTo(map);

}

map.on('click', onMapClick);