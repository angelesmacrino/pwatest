function setServiceWorker() {
    if (!'serviceWorker' in navigator) {
        console.log('Service Worker not supported');
        return
    }
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for (let registration of registrations) {
            console.log(registration)
        }
    });
    //check if the worker located in sw.js is already installed
    if (navigator.serviceWorker.controller) {
        console.log('Service Worker already installed');
        return
    }
    navigator.serviceWorker.register('/sw.js',  { scope: '/' })
    .then(function(reg) {
        console.log('Service Worker Registered!', reg.scope);
    })
   .catch(function(error) {
        console.log('Service Worker Registration Failed!', error);
    });
}

document.addEventListener('DOMContentLoaded', function() { 
    setServiceWorker();
    setFormEvent();
    console.log('DOM loaded');
});

function setFormEvent() {
    form.addEventListener('submit', function(event) {
        const form = document.getElementById('form');
        event.preventDefault(); // Prevent the default form submission behavior
        
        const formData = new FormData(form);
        
        const formDataObject = {};
        formData.forEach((value, key) => {
          formDataObject[key] = value;
        });
        formDataObject.status = 'pending';
      //  postMessageToServiceWorker(formDataObject);
            saveOnIndexedDb(formDataObject);
    });
}

function postMessageToServiceWorker(formData) {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        try {
            navigator.serviceWorker.controller.postMessage({
                action: 'submitForm',
                formData: formData
            })
            console.log('Message sent to service worker:');
        } catch (error) {
            console.error('Error sending message to service worker:', error);
        }
    } else {
        console.warn('Service Worker is not available or not controlling this page.');
    // Handle the form submission locally if the service worker is not available
    // You can use fetch or other methods to send data to the server
    }
}

//PRESIONO SUBMIT
//GUARDO EN INDEXEDBD
    // LE ASIGNO UN STATUS

function saveOnIndexedDb(formData) {

    const request = indexedDB.open('form_data', 1);
    request.onerror = function(event) {
        console.error('Error opening indexedDB:', event.target.error);
    };
    request.onsuccess = function(event) {
        const db = event.target.result;
        //each element of the form is a key, and its value the value
        const addRequest = db.transaction(['form_data'], 'readwrite')
            .objectStore('form_data')
            .add(formData);
        addRequest.onsuccess = function(event) {
            console.log('Form data added to indexedDB:', event.target.result);
        };
        addRequest.onerror = function(event) {
            console.error('Error adding form data to indexedDB:', event.target.error);
        };
    };
    request.onupgradeneeded = function(event) {
        const db = event.target.result;
        const objectStore = db.createObjectStore('form_data', { keyPath: 'id', autoIncrement: true });
        objectStore.createIndex('name', 'name', { unique: false });
        objectStore.createIndex('email', 'email', { unique: false });
        objectStore.createIndex('message', 'message', { unique: false });
    };
    sendToServer();
}

function sendToServer() {
    //canbio el status de pending a sending
    if (navigator.onLine) {
        iterateIndexedDbAndSendData();
        // Send data to the server
        // You can use indexedDB to get the data and send it to the server
    }
}

function iterateIndexedDbAndSendData() {
    //ITERO EN INDEXED DB A TODOS LOS FOMR Q TENGAN PENDING
    const request = indexedDB.open('form_data', 1);
    request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction(['form_data'], 'readwrite');
        const objectStore = transaction.objectStore('form_data');
        const getRequest = objectStore.getAll();
        getRequest.onsuccess = function(event) {
            const formData = event.target.result;
            formData.forEach(data => {
                if (data.status === 'pending') {
                    sendDataToServer(data);
                }
            });
        };
    };
}

function sendDataToServer(data) {
    fetch('https://example.com/api/form', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.ok) {
            console.log('Form data sent to the server:', data);
            deleteFromIndexedDb(data);
        } else {
            console.error('Error sending form data to the server:', response.status);
        }
    })
    .catch(error => {
        console.error('Error sending form data to the server:', error);
    });
//si falla el envio, lo dejo en pending
}

function deleteFromIndexedDb(data) {
    const request = indexedDB.open('form_data', 1);
    request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction(['form_data'], 'readwrite');
        const objectStore = transaction.objectStore('form_data');
        const deleteRequest = objectStore.delete(data.id);
        deleteRequest.onsuccess = function(event) {
            console.log('Form data deleted from indexedDB:', data);
        };
        deleteRequest.onerror = function(event) {
            console.error('Error deleting form data from indexedDB:', event.target.error);
        };
    };
}

navigator.connection.addEventListener('change', function(event) {
    console.log('network')
    console.log(event, event.target);
    if (event.target.effectiveType === '4g') {
        // Send data to the server
        // You can use indexedDB to get the data and send it to the server
    }
});

//online/offline event listener
window.addEventListener('online', function(event) {
    console.log('online')
    sendToServer();
});

window.addEventListener('offline', function(event) {
    console.log('offline')
    // Handle the offline event
    // You can use indexedDB to save the data
});
