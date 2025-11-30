export default defineNuxtPlugin((nuxtApp) => {
    const KEY = '__nuxt_last_chunk_reload_at__';
    const COOLDOWN_MS = 30_000;

    const now = () => Date.now();
    const last = () => Number(sessionStorage.getItem(KEY) || 0);
    const mark = () => sessionStorage.setItem(KEY, String(now()));
    const canReload = () => now() - last() >= COOLDOWN_MS;

    nuxtApp.hooks.hook('app:chunkError', () => {
        if (!canReload()) return;
        mark();
        location.reload();
    });
});
