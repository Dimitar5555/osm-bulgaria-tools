import fs from 'fs';
import { fetch_configs, fetch_data_from_overpass_turbo } from '../global/utilities.js';
import path, {dirname} from 'path';
import {preprocess_atp_data, preprocess_osm_data, distance, drop_tags, are_tags_mismatched, calc_bbox} from './utilities.js';

const local_path = path.resolve(dirname('../'))+'/data-processing/atp-data-sync';
const configs = fetch_configs(local_path);

const spiders = JSON.parse(fs.readFileSync(`${local_path}/data.json`))
.filter(spider => !spider.skip);
const alltheplaces_runs = `${configs.atp_url}/runs/history.json`;

async function fetch_json(url, options){
	var result = await fetch(url, options);
	return result.json();
}
async function fetch_atp_data(spider, run){
	// let data = await fetch_json(`${configs.atp_url}/runs/latest/output/${spider}.geojson`);
	let data = await fetch_json(`${configs.atp_url}/runs/${run}/output/${spider}.geojson`);
	return preprocess_atp_data(data, configs);
}
async function fetch_all_osm_data(wikidata_items, retry=false) {
	const formatted_selectors = wikidata_items.map(item => `nwr[${item.tag}]["${item.type?item.type:'brand'}:wikidata"="${item.wikidata}"](area.searchArea);`).join('');
	const query = `(${formatted_selectors});out center;`;
	console.log('Quering Overpass Turbo');
	
	var to_return = await fetch_data_from_overpass_turbo(query, true);
	if(to_return.length==0 && retry==false){
		console.error('ovepass returned empty result set, retrying');
		var temp = await fetch_all_osm_data(wikidata_items, true);
		if(temp.length!=0){
			to_return = temp;
		}
		console.error('empty result again, terminating');
		process.exit(1);
	}
	preprocess_osm_data(to_return);
	return to_return;
}

function match_atp_to_osm(osm, atp_points, max_distance=false){
	// when max distance is false, use fuzzy search
	var distances;
	if(max_distance){
		const bbox = calc_bbox(osm.coordinates, max_distance);
		distances = atp_points.map(atp=>distance(atp.coordinates, osm.coordinates, bbox));
	}
	else{
		distances = atp_points.map(atp=>distance(atp.coordinates, row.osm.coordinates));
	}
	const closest_index = distances.indexOf(Math.min(...(distances)));
	if(closest_index != -1 && (distances[closest_index] != Infinity || !max_distance)){
		return {index: closest_index, distance: distances[closest_index]};
	}
	return -1;
}

function process(shop, osm_points, atp_points){
	const match_start_timestamp = new Date();
	const total_ATP_points = atp_points.length;
	const total_OSM_points = osm_points.length;
	var result = [];

	const max_distance = shop.max_distance?shop.max_distance:configs.max_distance;

	osm_points.forEach((osm) => {
		const match = match_atp_to_osm(osm, atp_points, max_distance);

		var temp = {osm: drop_tags(osm), atp: false};

		if(match.index != -1){
			temp.dist = match.distance;
			temp.atp = drop_tags(atp_points.splice(match.index, 1)[0], true);
			if(temp.atp==[]){
				temp.atp = false;
			}
		}
		result.push(temp);
	});
	// match anything left, if fuzzy coords
	if(shop.fuzzy_coords){
		result.forEach((row, index) => {
			if(!row.atp && atp_points.length>0){
				//const distances = atp_points.map(atp=>valid_point(atp, item.key, item.value)?distance(atp.coordinates, row.osm.coordinates):+Infinity);
				const match = match_atp_to_osm(row.osm, atp_points);
				result[index].atp = drop_tags(atp_points.splice(match.index, 1), true)
				result.fuzzy = true;
				result.dist = match.distance;
			}
		});
	}
	
	result.forEach(row => {
		if(!row.osm || !row.atp){
			row.tags_mismatch = false;
			return;
		}
		row.tags_mismatch = are_tags_mismatched(row.osm?row.osm.tags:[], row.atp?row.atp.tags:[], shop.compare_keys);
	});

	console.log(shop.spider+' is done');
	atp_points.forEach(point => {
		result.push({osm: false, atp: drop_tags(point, true), tags_mismatch: false, dist: 0});
	});
	fs.writeFileSync(`${configs.output_path}/${shop.key}_${shop.value}_${shop.spider}.json`, JSON.stringify({
		metadata: {
			type: shop.type,
			wikidata: shop.wikidata,
			name: shop.name,
			compare_keys: shop.compare_keys
		},
		data: result.filter(a => a.osm === false || a.atp === false || a.tags_mismatch)
	}));
	return {
		counts: {
			atp: total_ATP_points,
			osm: total_OSM_points,
			tags_mismatches: result.filter(row => row.tags_mismatch).length,
		},
		name: shop.name,
		spider: shop.spider,
		key: shop.key,
		value: shop.value,
	}
}
async function start(){
	let brands_data = spiders.map(brand => {
		return brand.items.map(item => {
			return ({
				wikidata: brand.wikidata,
				type: brand.type?brand.type:item.type,
				tag: `${item.key}=${item.value}`,
				key: item.key,
				value: item.value,
				spider: brand.spider,
				compare_keys: item.compare_keys,
				name: brand.name,
				fuzzy_coords: item.fuzzy_coords
			});
		});
	}).flat();
	var osm_data = await fetch_all_osm_data(brands_data);
	var atp_cache = {};
	var stats = [];
	const last_run = (await fetch_json(alltheplaces_runs)).pop().run_id;
	await Promise.all(brands_data.map(async (brand, index) => {
		await new Promise(async (resolve) => setTimeout(async () => {
			console.log(`Starting ${brand.spider}`);
			var osm_points = osm_data.filter(item => item.wikidata === brand.wikidata && item.tags[brand.key] === brand.value);
			if(!atp_cache[brand.spider]){
				let temp = await fetch_atp_data(brand.spider, last_run);
				atp_cache[brand.spider] = temp;
			}
			var atp_points = atp_cache[brand.spider]
			.filter(point => point.tags[brand.key] === brand.value);
			let metadata = process(brand, osm_points, atp_points);
			stats.push(metadata);
			resolve();
		}, index * configs.delay));
	}))
	.then(() => {
		//let brands_list = brands.map(brand => ({name: brand.name, spider: brand.spider}));
		fs.writeFileSync(`${configs.output_path}/metadata.json`, JSON.stringify(stats));
		//current_data = current_data.sort((a, b) => a.metadata.spider.tag>b.metadata.spider.tag);
		//fs.writeFileSync(`data.json`, JSON.stringify(current_data));
		//stats.forEach((row, index) => stats[index].time_spent_matching = +((row.matching_time/row.total_time)*100).toFixed(2));
		//console.table(stats)
	});
}
start();
