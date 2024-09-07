function custom_fetch(url, is_prod=false) {
    if(is_prod) {
        url = `/osm-bulgaria-tools/${url}`;
    }
    return fetch(url);
}

function is_production() {
    return location.href.includes('gituhb');
}

function set_base_href() {
    const base_el = document.querySelector('base');
    if(!is_production()) {
        base_el.remove();
    }
}
window.onload = () => set_base_href();

function get_url_base() {
    if(is_production()) {
        return '/osm-bulgaria-tools/'
    }
    return '/';
}