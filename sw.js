console.log('ih')

self.addEventListener('install', evt => {
    console.log('Service Worker has been installed');
});

self.addEventListener('activate', evt => {
    console.log('Service Worker has been activated');
});

//fetch event

self.addEventListener('fetch', evt => {
    console.log('fetch event', evt);
});