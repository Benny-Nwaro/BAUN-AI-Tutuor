if(!self.define){let e,s={};const a=(a,i)=>(a=new URL(a+".js",i).href,s[a]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=a,e.onload=s,document.head.appendChild(e)}else e=a,importScripts(a),s()})).then((()=>{let e=s[a];if(!e)throw new Error(`Module ${a} didn't register its module`);return e})));self.define=(i,c)=>{const n=e||("document"in self?document.currentScript.src:"")||location.href;if(s[n])return;let r={};const t=e=>a(e,n),f={module:{uri:n},exports:r,require:t};s[n]=Promise.all(i.map((e=>f[e]||t(e)))).then((e=>(c(...e),r)))}}

// EXTREMELY IMPORTANT - FIX THE WORKBOX ROUTE HANDLING
// When the service worker gets updated by next-pwa, this ensures offline capability

// Force service worker activation
self.addEventListener('install', event => {
  console.log('[SW] Installing and forcing activation');
  self.skipWaiting();
  
  // Pre-cache critical routes
  const routesToCache = [
    '/ai/',
    '/ai/tutor/',
    '/ai/teaching-assistant/',
    '/ai/settings/',
    '/ai/profile/',
    '/ai/manifest.json',
    '/ai/icons/icon-512x512.png'
  ];
  
  event.waitUntil(
    caches.open('critical-routes-v2').then(cache => {
      console.log('[SW] Pre-caching routes:', routesToCache);
      return cache.addAll(routesToCache);
    })
  );
});

// Take control of all clients immediately
self.addEventListener('activate', event => {
  console.log('[SW] Activating and claiming clients');
  event.waitUntil(clients.claim());
});

// Ensure navigation requests are cached
const cacheThenNetwork = async (request) => {
  const cache = await caches.open('offline-pages-v2');
  
  try {
    // Try the cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[SW] Serving from cache:', request.url);
      return cachedResponse;
    }
    
    // If not in cache, try network and cache the result
    console.log('[SW] Fetching and caching:', request.url);
    const networkResponse = await fetch(request);
    
    // Only cache valid responses
    if (networkResponse && networkResponse.status === 200) {
      const clonedResponse = networkResponse.clone();
      cache.put(request, clonedResponse);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Fetch failed, serving homepage:', error);
    
    // On failure, try to return the cached homepage
    const cachedHome = await caches.match('/ai/');
    if (cachedHome) {
      return cachedHome;
    }
    
    // If all else fails, return an error response
    return new Response('Network error', { status: 408 });
  }
};

// Main fetch handler - CRITICAL FOR OFFLINE MODE
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;
  
  // For navigation requests, use the cacheThenNetwork strategy
  if (event.request.mode === 'navigate') {
    event.respondWith(cacheThenNetwork(event.request));
  }
});

// This will be replaced by workbox during the build
