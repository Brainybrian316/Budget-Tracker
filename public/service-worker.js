const APP_PREFIX = 'BudgetTracker-';
const VERSION = '1.0.0';
const CACHE_NAME = `${APP_PREFIX}${VERSION}`;

const FILES_TO_CACHE = [
  './index.html',
  './css/styles.css',
  './js/index.js',
  './js/idb.js',
  './manifest.json',
  './icons/icon-512x512.png',
  './icons/icon-384x384.png',
  './icons/icon-192x192.png',
  './icons/icon-152x152.png',
  './icons/icon-144x144.png',
  './icons/icon-128x128.png',
  './icons/icon-96x96.png',
  './icons/icon-72x72.png'
];

// install event listener
self.addEventListener('install', event => {
  // wait until the install event is complete
  event.waitUntil(
    // open a cache with the name of the cache we created above
    caches.open(CACHE_NAME)
    // add the files to the cache with a cache strategy of all of the files in the filesToCache array
      .then(cache => cache.addAll(FILES_TO_CACHE)));
      //  skip the waiting step and activate the service worker
      self.skipWaiting();
});

// activate event listener
self.addEventListener('activate', event => {
  //  remove the old cache
  event.waitUntil(
    // caches.keys returns a promise that resolves with a list of all the cache names
    caches.keys().then(cacheNames => {
      return Promise.all(
        // filter out the cache names
        cacheNames.filter(cacheName => {
          // if the cache name does not match the current cache name, then we delete it
          if (cacheName.startsWith(APP_PREFIX) && cacheName !== CACHE_NAME) {
            // return a promise that deletes the cache 
            return caches.delete(cacheName);
          }
        })
      )
    })
  )
  /* clients.claim() is used to take control of the clients of the service worker and to make it the active service worker */
  self.clients.claim(); 
})

// fetch event listener
self.addEventListener('fetch', event => {
  // if cache succeeds, then we trigger the GET request
  if (event.request.url.includes('/api/') && event.request.method === 'GET') {
    // we respond to the event with the cache
  event.respondWith(
    // we get the cache from the cache name
    caches.open(CACHE_NAME)
    // then we get the request from the cache name
      .then(cache  => {
        // return the cache as a fetch request
        return fetch(event.request)
        // if the request is successful, then we add the request to the cache using
        .then(response => {
          // if the response is valid, then we add it to the cache
          if (response.status === 200) {
            // we use .put to add the response to the cache and clone() to clone the response
            cache.put(event.request, response.clone());
          }
          // return the response
          return response;
        })
        // if the request is not successful, we catch the error and return the cache
        .catch(() => {
          // if failed, then we return the cache using .match to get the request from the cache that matches the request
          return cache.match(event.request);
        })
      })
      // we catch the error and return
      .catch(err => console.log(err))
  )
  // stop executing the event
  return;
};
    //  use offline fallback page if there is an error 
    event.respondWith(
      // we get the cache from the cache name that matches the request and we return the cache
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
});