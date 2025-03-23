import 'leaflet/dist/leaflet.css';

import 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.featuregroup.subgroup'

import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

import { get_url_base } from '/src/assets/js/utils.js';

export function init_map() {
	let map = L.map('map').setView([42.740, 25.450], 8);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 19,
		attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
	}).addTo(map);

    return map;	
}

export function get_icon(colour) {
	const url_start = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x';
	let icons = {
		green: new L.Icon({
			iconUrl: `${url_start}-green.png`,
			iconSize: [25, 41],
			iconAnchor: [12, 41],
			popupAnchor: [1, -34],
		}),
		orange: L.icon({
			iconUrl: `${url_start}-orange.png`,
			iconSize: [25, 41],
			iconAnchor: [12, 41],
			popupAnchor: [1, -34]
		}),
		red: L.icon({
			iconUrl: `${url_start}-red.png`,
			iconSize: [25, 41],
			iconAnchor: [12, 41],
			popupAnchor: [1, -34]
		}),
		violet: L.icon({
			iconUrl: `${url_start}-violet.png`,
			iconSize: [25, 41],
			iconAnchor: [12, 41],
			popupAnchor: [1, -34]
		}),
		blue: L.icon({
			iconUrl: `${url_start}-blue.png`,
			iconSize: [25, 41],
			iconAnchor: [12, 41],
			popupAnchor: [1, -34]
		})
	};
    return icons[colour];
}