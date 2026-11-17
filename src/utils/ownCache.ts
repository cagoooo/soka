// 同一個網域（cagoooo.github.io）底下有很多工具，快取與 Service Worker 註冊是共用的。
// 這裡只認「本工具（/soka/）自己的」快取與註冊，清除時不影響其他工具。
const SCOPE = new URL(import.meta.env.BASE_URL, window.location.origin).href; // https://cagoooo.github.io/soka/

// vite.config.ts 的 runtimeCaching cacheName
const OWN_RUNTIME_CACHES = ['soka-pages-cache', 'soka-google-fonts-cache', 'soka-gstatic-fonts-cache'];

// workbox 預快取名稱含 scope 網址，例：workbox-precache-v2-https://cagoooo.github.io/soka/
export const isOwnCache = (name: string) => name.includes(SCOPE) || OWN_RUNTIME_CACHES.includes(name);

export const isOwnRegistration = (registration: ServiceWorkerRegistration) =>
    registration.scope.startsWith(SCOPE);
