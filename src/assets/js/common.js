if(location.hostname.includes('github')) {
    const base = document.createElement('base')
    base.href = '/osm-bulgaria-tools/';
    document.head.appendChild(base);
}