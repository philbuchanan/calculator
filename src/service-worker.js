const cacheName = 'v5.4.0';
const contentToCache = [
	'index.html',
	'main.js',
	'assets/touch-icon-iphone-114.png',
	'assets/touch-icon-iphone-120.png',
	'assets/touch-icon-iphone-152.png',
	'assets/touch-icon-iphone-180.png',
	'assets/touch-icon-iphone-87.png',
	'assets/touch-icon-iphone-76.png',
	'assets/touch-icon-iphone-58.png',
	'assets/app-icon-large.png',
];

self.addEventListener('install', (e) => {
	e.waitUntil((async () => {
		const cache = await caches.open(cacheName);

		await cache.addAll(contentToCache);
	})());
});

self.addEventListener('fetch', (e) => {
	e.respondWith((async () => {
		const r = await caches.match(e.request);

		if (r) {
			return r;
		}

		const response = await fetch(e.request);
		const cache = await caches.open(cacheName);

		cache.put(e.request, response.clone());

		return response;
	})());
});

self.addEventListener('activate', (e) => {
	e.waitUntil(caches.keys().then((keyList) => {
		return Promise.all(keyList.map((key) => {
			if (key === cacheName) {
				return;
			}

			return caches.delete(key);
		}));
	}));
});
