const STATIC_CACHE_NAME = 'site-static';
const ASSETS = [
    //requests
    '/',
    '/index.html',
    //scripts
    '/js/app.js',
    '/js/submit.js'
];
//aca cacheo cosas q no cambien muy seguido
self.addEventListener('install', evt => {
    //no termina el evento hasta que no se complete la promesa del cache
    evt.waitUntil(cacheApp());
});

function cacheApp() {
    caches.open(STATIC_CACHE_NAME)
    .then(cache => {
        console.log('caching shell assets');
        cache.addAll(ASSETS);
    });
}

self.addEventListener('activate', evt => {
    //console.log('Service Worker has been activated');
});

//fetch event

self.addEventListener('fetch', evt => {
    //me fjo si el request esta en el cache, si no lo agrego
    evt.respondWith(
        caches.match(evt.request)
        .then(cacheRes => {
            return cacheRes || fetch(evt.request);
        })
    );
});