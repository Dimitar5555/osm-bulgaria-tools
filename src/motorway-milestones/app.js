import { init_map, get_icon } from '/src/assets/js/map.js';
import { custom_fetch } from '/src/assets/js/utils.js';

import L from 'leaflet';

function reduce_array_to_ranges(array) {
    const ranges = [];
    let start = array[0];
    let end = array[0];
    for(let i = 1; i < array.length; i++) {
        if(array[i] - end === 1) {
            end = array[i];
        } else {
            ranges.push([start, end]);
            start = array[i];
            end = array[i];
        }
    }
    ranges.push([start, end]);
    for(let i = 0; i < ranges.length; i++) {
        if(ranges[i][0] === ranges[i][1]) {
            ranges[i] = ranges[i][0];
        }
    }
    return ranges;
}

function get_div_icon_with_number(number, color) {
    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="text-white bg-${color} text-center fs-${number>=100?6:5} rounded-2">${number}</div>`,
        iconSize: [34, 42],
        iconAnchor: [17, 21]
    });
}

async function start() {
    map = init_map();
    const motorways = await custom_fetch('/motorway-milestones/data.json')
    .then(response => response.json());
    const table_body = document.querySelector('tbody');
    for(const motorway of motorways) {
        console.log(motorway);
        const row = document.createElement('tr');
        
        {
            const td = document.createElement('td');
            td.textContent = motorway.name;
            row.appendChild(td);
        }

        {
            const td = document.createElement('td');
            td.textContent = motorway.ranges.map(([start, end]) => `${start} - ${end}`).join(', ');
            row.appendChild(td);
        }

        {
            const td = document.createElement('td');
            td.textContent = reduce_array_to_ranges(motorway.warnings.missing).map((range) => range.length==2?`${range[0]} - ${range[1]}`:range).join(', ');
            row.appendChild(td);
        }

        table_body.appendChild(row);

        if(motorway.warnings.out_of_range.length) {
            // for(const marker_data of motorway.warnings.out_of_range) {
            //     const marker = L.marker(marker_data.coords);
            //     marker.setIcon(get_icon('red'));
            //     marker.bindPopup(`${motorway.name}\nкм. ${marker_data.distance}`);
            //     marker.addTo(map);
            // }
        }

        if(motorway.warnings.milestones.length) {
            for(const marker_data of motorway.warnings.milestones) {
                const marker = L.marker(marker_data.coords);
                let colour = 'danger';
                if(marker_data.suspicious) {
                    colour = 'warning';
                }
                else if(marker_data.double) {
                    colour = 'success';
                }
                marker.setIcon(get_div_icon_with_number(marker_data.distance, colour));
                let text = `${motorway.name}\nкм. ${marker_data.distance}`;
                if(marker_data.osm_id) {
                    const anchors = marker_data.osm_id.toString().split(';').map(id => `<a href="https://osm.org/node/${id}" target="_blank">n${id}</a>`).join(', ');
                    text += `<br>${anchors}`;
                }
                marker.bindPopup(text);
                marker.addTo(map);
            }
        }
    }
}

start();