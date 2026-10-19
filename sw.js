/* Banphayoe service worker
   - ไฟล์ของเว็บเอง: โหลดจากเน็ตก่อนเสมอ (อัปเดต index.html แล้วเห็นของใหม่ทันที) ถ้าเน็ตหลุดค่อยใช้ของที่เก็บไว้
   - Firebase / Google / ฟอนต์ ฯลฯ (ข้ามโดเมน): ไม่แตะต้อง ปล่อยผ่านตามปกติ */
const CACHE = 'banphayoe-shell-v1';
const SHELL = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL).catch(() => {})).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return;
  e.respondWith(
    fetch(r).then(res => {
      if (res && res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)).catch(() => {}); }
      return res;
    }).catch(() => caches.match(r).then(m => m || (r.mode === 'navigate' ? caches.match('index.html') : undefined)))
  );
});
