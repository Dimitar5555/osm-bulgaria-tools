function custom_fetch(url) {
    if(is_production()) {
        url = `/osm-bulgaria-tools/${url}`;
    }
    return fetch(url);
}

function is_production() {
    return location.href.includes('github');
}

function set_base_href() {
    const base_el = document.querySelector('base');
    if(!is_production()) {
        base_el.remove();
    }
}
window.onload = () => set_base_href();

function update_dev_anchors() {
    if(!is_production()) {
        let a = document.querySelectorAll('a[href]');
        a.forEach(entry => {
            let href = entry.getAttribute('href');
            if(href.includes('/osm-bulgaria-tools/')) {
                entry.setAttribute('href', href.replace('/osm-bulgaria-tools/', '/'));
            }
        })
    }
}

function get_url_base() {
    if(is_production()) {
        return '/osm-bulgaria-tools/'
    }
    return '/';
}