// imports
importScripts('js/sw-utils.js');

// Arreglo para definir constantes de caché
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';
const INMUTABLE_CACHE = 'inmutable-v1';

// Arreglo App Shell, tiene todo lo necesario para mi aplicación
// Lo que tiene que estar cargado de manera instantánea
// o lo que debería de estar cargado lo antes posible
const APP_SHELL = [
    //'/',
    'index.html', // Se pone el .html
    'css/style.css',
    'img/favicon.ico',
    'js/app.js',
    'img/avatars/hulk.jpg',
    'img/avatars/ironman.jpg',
    'img/avatars/spiderman.jpg',
    'img/avatars/thor.jpg',
    'img/avatars/wolverine.jpg',
     'js/sw-utils.js'
];

// Todo lo que NO SE VA A MODIFICAR JAMÁS
const APP_SHELL_INMUTABLE = [
    'https://fonts.googleapis.com/css?family=Quicksand:300,400',
    'https://fonts.googleapis.com/css?family=Lato:400,300',
    'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
    'js/libs/jquery.js'
];

// Instalar el evento del caché
self.addEventListener('install', e => {
     // Abre el caché estático y añade todos los recursos del APP_SHELL
    const cacheStatic = caches.open(STATIC_CACHE).then(cache => 
        cache.addAll(APP_SHELL) // este cache, hace referencia al de arriba
    );

     // Abre el caché inmutable y añade todos los recursos del APP_SHELL
     const cacheInmutable = caches.open(INMUTABLE_CACHE).then(cache => 
        cache.addAll(APP_SHELL_INMUTABLE) // este cache, hace referencia al de arriba
    );

    // Espera hasta que ambas operaciones de caché (estático e inmutable) se completen antes de terminar la instalación
    e.waitUntil(Promise.all([cacheStatic, cacheInmutable]));
});

// Proceso para que se borren los cachés anteriores de un sw
// Que ya no van a servir
self.addEventListener('activate', e => {
    // Obtiene todas las claves (nombres) de los cachés almacenados
    const respuesta = caches.keys().then(keys => {
        // Itera sobre cada clave del caché
        return Promise.all(
            keys.map(key => {
                // Si la clave no es igual al nombre del caché estático actual y contiene la palabra 'static', elimina ese caché
                if (key !== STATIC_CACHE && key.includes('static')) {
                    return caches.delete(key);
                }

                 // Si la clave no es igual al nombre del caché inmutable actual y contiene la palabra 'static', elimina ese caché

                if (key !== INMUTABLE_CACHE && key.includes('inmutable')) {
                    return caches.delete(key);
                }
            })
        );
    });

    // Espera hasta que todas las promesas de eliminación de caché se completen antes de finalizar la activación
    e.waitUntil(respuesta);
});


// Evento 'fetch' para interceptar las solicitudes de red
self.addEventListener('fetch', e => {
    // Busca la solicitud en el caché
    const respuesta = caches.match(e.request).then(res => {
        // Si la solicitud está en el caché, devuelve la respuesta almacenada
        if (res) {
            return res;
        } else {
            // Si la solicitud no está en el caché, realiza una nueva solicitud a la red
            return fetch(e.request).then(newRes => {
                // Actualiza el caché dinámico con la nueva respuesta
                return actualizaCacheDinamico(DYNAMIC_CACHE, e.request, newRes);
            });
        }
    });

    // Responde con la respuesta obtenida (del caché o de la red)
    e.respondWith(respuesta);
});
