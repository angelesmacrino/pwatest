const STATIC_CACHE_NAME = 'site-static';
const DYNAMIC_CACHE_NAME = 'site-dynamic';
const ASSETS = [
    //requests
    '/',
    '/index.html',
    //fallback
    '/pages/fallback.html',
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
    //TODO: si refresco a veces falla xq no hace clients.claim() de nuevo
    clients.claim();
    //console.log('Service Worker has been activated');
    //delete old caches, loop and delete every cache that is not current cache
    evt.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys
                .filter(key => key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME)
                .map(key => caches.delete(key))
            )
        })
    );
});

//fetch event

self.addEventListener('fetch', evt => {
    evt.respondWith(
        caches.match(evt.request)
        .then(cacheRes => {
            return cacheRes || fetch(evt.request).then(fetchRes => {
                //stores the request in the dynamic cache
                return caches.open(DYNAMIC_CACHE_NAME).then(cache => {
                    //prevent chrome extension errors
                    if(!evt.request.url.startsWith('http')){
                        return fetchRes;
                    }
                    cache.put(evt.request.url, fetchRes.clone());
                    return fetchRes;
                });
            });
        }).catch(() => {
            //in case of going offline
            if(evt.request.url.indexOf('.html') > -1){
                return caches.match('/pages/fallback.html');
            }
        })
    );
});

//UN FALLBACK QUE SE PREGUNTE SI GUARDE ALGO EN INDEXDB??

/*
    APRETO BOTON DE SUBMIT
    - SE GUARDA EN INDEXDB
    - VERIFICO SI HAY CONEXION
    - SI HAY CONEXION, ENVIO LOS DATOS DE INDEXDB
    - SI NO HAY CONEXION, GUARDO EN INDEXDB
    1- CUANDO HAY CONEXION, ENVIO LOS DATOS DE INDEXDB AUTOMATICAMENTE Y LOS ELIMINO DE INDEXDB
    2- PODER REENVIAR CUANDO HAYA CONECCION
    - ¿QUE SE ELIMINE DE INDEXDB SI SE MANDA EXITOSAMENTE AL SERVER?
*/

//receiviing post message from app.js

self.addEventListener('message', event => {
    if (event.data.action === 'submitForm') {
      // Process form data here
      console.log('Form data received in the service worker:', event.data.formData);
      // Perform actions like sending data to the server, caching, etc.
    }
  });

// Listen for the 'offline' event
self.addEventListener('offline', (event) => {
    // Handle the offline event
    console.log('The application is offline.');
  });
  
  // Listen for the 'online' event
  self.addEventListener('online', (event) => {
    // Handle the online event
    console.log('The application is online.');
  });
  