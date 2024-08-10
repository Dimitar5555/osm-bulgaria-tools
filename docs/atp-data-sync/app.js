function createTable(parent, items, spider_data, type, options=false) {
	var table = document.createElement('table');
	var tableData = generate_issue_table(type=='flagged'?items.sort((a,b) => a.dist>b.dist):items, spider_data, type);
	var notice = false;
	console.log(tableData);
	/*if(options){
		Object.keys(options).forEach(key => div.setAttribute(key, options[key]));
	}*/
	var tableBody = document.createElement('tbody');
	table.classList.add('table', 'table-bordered');
	tableData.forEach((rowData, rowIndex) => {
		var row = document.createElement('tr');

		rowData.forEach((cellData) => {
			var cell = document.createElement(rowIndex==0?'th':'td');
			if(Array.isArray(cellData)){
				cellData.forEach(el => cell.appendChild(el));
			}
			else if(typeof cellData!='object'){
				cell.innerText = cellData;
			}
			/*else if(el && el!=undefined){
				cellData.forEach(el => cell.appendChild(el));
			}*/
			row.appendChild(cell);
		});

		tableBody.appendChild(row);
	});
	if(type=='not_in_ATP'){
		notice = document.createElement('div');
		notice.classList.add('alert', 'alert-warning');
		notice.innerText = 'Възможно е обекта да не е добавен в сайта на компанията или да е временно затворен. Възможно е обекта да е сложен на грешно място в OSM или данните в сайт на компанията да не са верни.';
	}
	else if(type=='not_in_OSM'){
		notice = document.createElement('div');
		notice.classList.add('alert', 'alert-warning');
		notice.innerText = 'Възможно е обекта да е нанесен в OSM, но локацията му да не е вярна. Възможно е информацията за локацията в сайта на компанията да не е точна.';

	}
	if(notice){
		parent.appendChild(notice);
	}
	table.appendChild(tableBody);
	parent.appendChild(table);
	parent.classList.add('pt-2')
}

/*function createLink(url, text, newTab=true){
	var a = document.createElement('a');
	a.innerText = text;
	a.setAttribute('href', url);
	if(newTab){
		a.setAttribute('target', '_blank');
	}
	return a;
}

function createText(text){
	return document.createTextNode(text);
}*/

/*function generateOSMlinks(data){
	var res = [];
	if(Array.isArray(data)){
		res.push(createLink(`https://www.openstreetmap.org/#map=19/${data[0]}/${data[1]}`, 'OSM'));
	}
	else{
		res.push(createLink(`https://www.openstreetmap.org/${data.type}/${data.id}`, 'OSM'));
		res.push(createText(' '));
		res.push(createLink(`https://www.openstreetmap.org/${data.type}/${data.id}`, 'iD'));
		res.push(createText(' '));
		res.push(createLink(`https://www.openstreetmap.org/${data.type}/${data.id}`, 'JOSM'));
	}
	return res;
}*/

function generate_OSM_link(location) {
	return createHTMLElement('a', {innerText: 'OSM', href: `https://www.openstreetmap.org/${location.type}/${location.id}`, target: '_blank'});
}

/*function createDiv(id){
	if(!document.querySelector(`#${id}`)){
		var div = document.createElement('div');
		div.setAttribute('id', id);
		document.querySelector('#panes').appendChild(div);
	}
	return document.querySelector(`#${id}`);
}*/

function createHTMLElement(tag, options={}, children=[]){
	var res = document.createElement(tag);
	Object.keys(options).forEach(attribute => {
		if(attribute=='innerText'){
			res.innerText = options.innerText;
		}
		else if(attribute=='value'){
			res.value = options.value;
		}
		else{
			res.setAttribute(attribute, options[attribute]);
		}
	});
	children.forEach(child => res.appendChild(child));
	return res;
}

/*function generateTagsBox(tags){
	var tags = tags.filter(a => a[1]!=undefined).sort((a, b)=>a[0]>b[0]);
	console.log(tags.map(tag => tag[0] + ' = ' + tag[1]))
	var textarea = createHTMLElement('textarea', {
		value: tags.map(tag => tag[0] + ' = ' + tag[1]).join('\n'),
		class: 'form-control',
		cols: 30,
		rows: 4,
		readonly: 'true',
		onfocus: 'document.execCommand("copy");',
		oncopy: 'event.preventDefault();if (event.clipboardData) {event.clipboardData.setData("text/plain", `\n${this.value}`);}'
	});
	return [textarea];
}*/

//type:
//missing_OSM
//missing_ATP
//all else

/*function generate_issue_table(data, spider_data, type){
	var table = [];
	if(type=='not_in_ATP' || type=='not_in_OSM'){
		table.push(['', 'Детайли', 'Връзки']);
	}
	else{
		table.push(['', 'Обект', 'Тагове', 'Разстояние', 'Връзки'])
	}
	if(!spider_data.compare_keys){
		spider_data.compare_keys = [];
	}
	data.forEach((row, index) => {
		var tableRow = [index+1];
		if(type=='not_in_ATP'){
			tableRow[1] = 'Липсва в сайта на компанията';
			tableRow[2] = generateOSMlinks(row.osm);
		}
		else if(type=='not_in_OSM'){
			tableRow[1] = `${row.atp.tags.name}${row.atp.tags["addr:full"]?"\nАдрес: "+row.atp.tags["addr:full"]:""}`;
			var starter_keys = spider_data.compare_keys.filter(tag => tag!=='fuel:*');
			var keys = starter_keys.concat(Object.keys(row.atp.tags).filter(property=>property.indexOf('fuel:')!==-1));
			tableRow[2] = generateTagsBox(keys.map(key => [key, row.atp.tags[key]]));
			tableRow[3] = generateOSMlinks(row.osm?row.osm:row.atp.coordinates);
		}
		else{
			console.log(type, row.atp, row.atp.tags)
			//var tags = row.tags;
			let addr = row.atp.tags["addr:full"]?row.atp.tags["addr:full"]:row.atp.tags["addr:street_address"];
			tableRow[1] = `${row.atp?.tags?.name}\nАдрес: ${addr}`;
			//console.log(row.tags.filter(tag => tag.indexOf('+')==0).map(tag => tag.split('+')[1]).map(tag => [tag, row.atp.properties[tag]]));
			tableRow[2] = generateTagsBox(spider_data.compare_keys.filter(key => row.atp.tags[key]!=row.osm.tags[key]).map(key => [key, row.atp.tags[key]]));
			tableRow[3] = row.dist;
			tableRow[4] = generateOSMlinks(row.osm?row.osm:row.atp.coordinates);
			if(row.fuzzy){
				//tableRow
			}
		}
		table.push(tableRow);
	});
	return table;
}*/

/*function show_tab(id) {
	var tabs = Array.from(document.querySelector('#panes').children);
	tabs.forEach(tab => {
		if(tab.id==id){
			tab.classList.remove('d-none');
			return;
		}
		tab.classList.add('d-none');
	});
}*/

/*function preprocess_data(data) {
	//simplify metadata items filter issues
	var result = [];
	for(const brand of data){
		console.log(brand)
		for(const item of brand.metadata.items){
			var new_item = {
				metadata: {
					run_date: brand.metadata.run_date,
					name: brand.metadata.name,
					spider: brand.metadata.spider,
					key: item.key,
					value: item.value,
					compare_keys: item.compare_keys,
				},
				flagged: brand.flagged.filter(el => el?.osm?.tags?.[item.key] === item.value || el?.atp?.tags?.[item.key] === item.value)
			};
			new_item.metadata.osm_count = new_item.flagged.filter(el => el.osm).length;
			new_item.metadata.atp_count = new_item.flagged.filter(el => el.atp).length;
			result.push(new_item);
		}
	}
	return result;
}*/

function init_map() {
	icons = {
		green: L.icon({
			iconUrl: '../assets/images/marker-icon-green.png',
			iconSize: [25, 41],
			iconAnchor: [12, 41],
			popupAnchor: [1, -34]
		}),
		orange: L.icon({
			iconUrl: '../assets/images/marker-icon-orange.png',
			iconSize: [25, 41],
			iconAnchor: [12, 41],
			popupAnchor: [1, -34]
		}),
		red: L.icon({
			iconUrl: '../assets/images/marker-icon-red.png',
			iconSize: [25, 41],
			iconAnchor: [12, 41],
			popupAnchor: [1, -34]
		})
	};
	map = L.map('map').setView([42.740, 25.450], 8);
	L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 19,
		attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
	}).addTo(map);
}

function load_data(){
	/*function generate_tab_button(ul, id, text, count=0){
		
		var btn = document.createElement('button');
		if(count==0){
			btn.classList.add('btn', 'btn-primary');
			btn.setAttribute('onclick', 'show_tab(this.dataset.target)');
			/*btn.setAttribute('data-bs-toggle', 'tab');
			btn.setAttribute('type', 'button');
			btn.setAttribute('role', 'tab');
			btn.setAttribute('data-target', id);
		}
		else{
			btn.classList.add('nav-link');
			btn.setAttribute('data-bs-target', `#${id}`);
			btn.setAttribute('data-bs-toggle', 'tab');
			btn.setAttribute('role', 'tab')
		}
		btn.innerText = text;
		if(count!=0){
			var li = document.createElement('li');
			li.classList.add('nav-item');
			var badge = document.createElement('span');
			badge.innerText = count;
			badge.classList.add('badge', 'bg-primary');
			btn.appendChild(createText(' '));
			li.appendChild(btn);
			btn.appendChild(badge);
			ul.appendChild(li);
		}
		else{
			ul.appendChild(btn);
		}

		return btn;
	}*/
    custom_fetch('data/metadata.json')
    .then(res => res.json())
	.then(data => data.sort((a, b) => a.spider.localeCompare(b.spider) || a.key.localeCompare(b.key)  || a.value.localeCompare(b.value)))
	.then(spiders => {
		populate_overview_table(spiders, true);
	});
}

function populate_overview_table(spiders, by_category=false) {
	function generate_link(spider_name, label) {
		return createHTMLElement('a', {innerText: label, href: `?spider=${spider_name}`});
	}
	const overview_table = document.querySelector('#overview');
	if(by_category) {
		spiders.sort((a, b) => {
			return a.key>b.key || a.value>b.value || a.spider>b.spider;
		})
	}
	let last_category;
	for(const spider of spiders) {
		let current_category = `${spider.key}=${spider.value}`;
		if(by_category && last_category != current_category) {
			let tr = createHTMLElement('tr', {}, [
				createHTMLElement('th', {colspan: 4, innerText: current_category, class: 'text-center'})
			]);
			overview_table.appendChild(tr);
			last_category = current_category;
		}
		let tr = createHTMLElement('tr', {}, [
			createHTMLElement('td'),
			createHTMLElement('td', {innerText: spider.counts.atp}),
			createHTMLElement('td', {innerText: spider.counts.osm}),
			createHTMLElement('td', {innerText: spider.counts.tags_mismatches})
		]);
		if(by_category) {
			tr.children[0].appendChild(generate_link(spider.spider, spider.name));
			//generate_tab_button(tr.children[4], `${points.metadata.spider}_${points.metadata.key}_${points.metadata.value}`, 'Детайли', false)
		}
		else {
			tr.children[0].innerText = `${spider.key}=${spider.value}`;
		}
		overview_table.appendChild(tr);
	}
}

function generate_tags_box(check_tags, atp_tags, osm_tags={}) {
	let textarea = createHTMLElement('textarea', {class: 'bg-white resize-none border-2', disabled: true, rows: 5});
	let key_value_pairs = ['brand', 'brand:wikidata', 'operator', 'operator:wikidata']
	.concat(check_tags)
	.filter(key => atp_tags[key])
	.filter(key => atp_tags[key] != osm_tags[key])
	.map(key => `${key}=${atp_tags[key]}`)
	.join('\n');
	textarea.value = key_value_pairs;
	return textarea;
}

function show_spider_data(spider_name) {
    custom_fetch('data/metadata.json')
    .then(res => res.json())
	.then(spiders => spiders.filter(spider => spider.spider === spider_name))
	.then(async (spiders) => {
		let cluster_group = new L.markerClusterGroup({
			disableClusteringAtZoom: 16,
			showCoverageOnHover: false
		}).addTo(map);
		let overlays = {};
		populate_overview_table(spiders);
		for(const spider of spiders) {
			/*if(last_category!==`${points.metadata.key}=${points.metadata.value}`){
				last_category = `${points.metadata.key}=${points.metadata.value}`;
				overview_table.appendChild(createHTMLElement('tr', {}, [createHTMLElement('th', {innerText: last_category, colspan: 5})]));
			}*/
			const locations_response = await custom_fetch(`data/${spider.key}_${spider.value}_${spider.spider}.json`);
			const spider_data = (await locations_response.json());
			const locations = spider_data.data;
			let not_in_osm = [];
			let not_in_atp = [];
			let mismatched_tags = [];
			for(const location of locations) {
				let coordinates = (location.osm?location.osm:location.atp).coordinates;
				let marker = new L.marker(coordinates);
				//.bindPopup(popup);
				if(location.atp) {
					location.atp.tags[`${spider_data.metadata.type}:wikidata`] = spider_data.metadata.wikidata;
					location.atp.tags[spider_data.metadata.type] = spider_data.metadata.name;
				}
				if(!location.osm) {
					marker.bindPopup(generate_tags_box(spider_data.metadata.compare_keys, location.atp.tags, {}));
					marker.setIcon(icons.green);
					not_in_osm.push(marker);
				}
				if(!location.atp) {
					let popup = createHTMLElement('div', {}, [
						//generate_tags_box(spider, location.atp.tags),
						generate_OSM_link(location.osm)
					]);
					marker.bindPopup(popup);
					marker.setIcon(icons.red);
					not_in_atp.push(marker);
				}
				if(location.tags_mismatch && spider_data.metadata.compare_keys) {
					let popup = createHTMLElement('div', {}, [
						generate_tags_box(spider_data.metadata.compare_keys, location.atp.tags, location.osm.tags),
						generate_OSM_link(location.osm)
					]);
					marker.bindPopup(popup);
					marker.setIcon(icons.orange);
					mismatched_tags.push(marker);
				}
			}
			console.log(spider, spiders)
			console.log(not_in_osm, not_in_atp, mismatched_tags);
			let not_in_osm_sub = L.featureGroup.subGroup(cluster_group, not_in_osm).addTo(map);
			let not_in_ato_sub = L.featureGroup.subGroup(cluster_group, not_in_atp).addTo(map);
			let mismatched_tags_sub = L.featureGroup.subGroup(cluster_group, mismatched_tags).addTo(map);
			
			overlays[`${spider.key}=${spider.value}_not_in_osm_sub`] = not_in_osm_sub;
			overlays[`${spider.key}=${spider.value}_not_in_ato_sub`] = not_in_ato_sub;
			overlays[`${spider.key}=${spider.value}_mismatched_tags_sub`] = mismatched_tags_sub;
		}
		L.control.layers([], overlays, {collapsed: true}).addTo(map);
	})
}

document.addEventListener('DOMContentLoaded', () => {
	let spider = new URLSearchParams(window.location.search).get('spider');
	console.log(spider)
	if(spider) {
		document.querySelector('#map').classList.remove('hidden');
		init_map();
		show_spider_data(spider);
	}
	else {	
		load_data();
	}
});
