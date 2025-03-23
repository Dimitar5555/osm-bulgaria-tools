export function custom_fetch(url) {
    return fetch(`${get_url_base()}${url}`);
}

function is_production() {
    return location.href.includes('github');
}

export function get_url_base() {
    if(is_production()) {
        return '/osm-bulgaria-tools/'
    }
    return '';
}

const base = document.createElement('base');
if(is_production()) {
    base.href = 'https://dimitar5555.github.io/osm-bulgaria-tools/';
}
else {
    base.href = '/';
}
document.head.appendChild(base);