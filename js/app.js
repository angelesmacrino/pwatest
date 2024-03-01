function setServiceWorker() {
    if (!'serviceWorker' in navigator) {
        console.log('Service Worker not supported');
        return
    } 
    navigator.serviceWorker.register('/sw.js')
    .then(function(reg) {
        console.log('Service Worker Registered!', reg);
    })
   .catch(function(error) {
        console.log('Service Worker Registration Failed!', error);
    });
}

document.addEventListener('DOMContentLoaded', function() { 
    setServiceWorker();
    console.log('DOM loaded');
});

