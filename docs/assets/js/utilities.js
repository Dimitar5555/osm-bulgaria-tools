function custom_fetch(url) {
    if(is_prod) {
        url = `${location.pathname}${url}`;
    }
    return fetch(url);
}
