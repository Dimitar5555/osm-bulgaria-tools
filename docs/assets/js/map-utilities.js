function init_map() {
	let map = L.map('map').setView([42.740, 25.450], 8);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 19,
		attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
	}).addTo(map);

    return map;	
}

function get_icon(colour) {
	let icons = {
		green: L.icon({
			iconUrl: `${get_url_base()}assets/images/marker-icon-green.png`,
			iconSize: [25, 41],
			iconAnchor: [12, 41],
			popupAnchor: [1, -34]
		}),
		orange: L.icon({
			iconUrl: `${get_url_base()}assets/images/marker-icon-orange.png`,
			iconSize: [25, 41],
			iconAnchor: [12, 41],
			popupAnchor: [1, -34]
		}),
		red: L.icon({
			iconUrl: `${get_url_base()}assets/images/marker-icon-red.png`,
			iconSize: [25, 41],
			iconAnchor: [12, 41],
			popupAnchor: [1, -34]
		})
	};
    return icons[colour];
}