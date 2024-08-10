import fs from 'fs';

function combine_configs(local_configs, global_configs) {
	// get global, let local overwirte global
	if(local_configs == {}) {
		return global_configs;
	}
	for(const key of Object.keys(global_configs)) {
		if(!local_configs[key]) {
			local_configs[key] = global_configs[key];
		}
	}
	return local_configs;
}

export function fetch_configs(local_configs_path=false) {
	let global_configs = JSON.parse(fs.readFileSync('./data-processing/global/config.json'));
	let local_configs = {};
	if(local_configs_path) {
		local_configs = JSON.parse(fs.readFileSync(`${local_configs_path}/config.json`));
	}
	return combine_configs(local_configs, global_configs);
}