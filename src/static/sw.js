/* Service Worker */

const VERSION = "v1";
let ROOT_PATH = "/";
const CACHE_NAME = `meomor-${VERSION}`;

// Listen for root path from the main thread
self.addEventListener("message", (event) => {
  if (event.data.type === "SET_ROOT_PATH") {
    ROOT_PATH = event.data.rootPath;
    //console.log("Service worker root path set to:", ROOT_PATH);
  }
});

// all the files that need to be cached for offline functionality
/*
const APP_STATIC_RESOURCES = [
  window.gams_frog._root_path + "/",
  window.gams_frog._root_path + "/index.html",
  window.gams_frog._root_path + "/about.html",
  window.gams_frog._root_path + "/datamodel.html",
  window.gams_frog._root_path + "/geobrowser.html",
  window.gams_frog._root_path + "/imprint.html",
  window.gams_frog._root_path + "/map.html",
  window.gams_frog._root_path + "/search.html",
  window.gams_frog._root_path + "/search-xsl.html",
  window.gams_frog._root_path + "/objects/index.html", // Biographies
  window.gams_frog._root_path + "/static/css/project.css",
  window.gams_frog._root_path + "/static/img/main_logo.jpg" 
  //maps, etc. window.gams_frog._root_path + "/static/apps/" 
  // add more files as needed
];
*/

const APP_STATIC_RESOURCES = [
]; 

// Saving the cache on PWA installation
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      cache.addAll(APP_STATIC_RESOURCES);
    })(),
  );
});

// Updating the PWA and deleting old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
          return undefined;
        }),
      );
      await clients.claim();
    })(),
  );
});

// Fetch event
self.addEventListener("fetch", (event) => {
  // when seeking an HTML page
  if (event.request.mode === "navigate") {
    // Return to the index.html page
    event.respondWith(caches.match("/"));
    return;
  }

  // For every other request type
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(event.request.url);
      if (cachedResponse) {
        // Return the cached response if it's available.
        return cachedResponse;
      }
      // Respond with a HTTP 404 response status.
      return new Response(null, { status: 404 });
    })(),
  );
});

