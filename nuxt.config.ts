// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: { enabled: true },
    $production: {
        nitro: {
            compressPublicAssets: true,
        },
    },
    devServer: {
        host: '0.0.0.0',
        port: Number(process.env.NUXT_PORT) || 3011,
    },
    ssr: true,
    alias: {
        '@styles': '/assets/styles',
    },
    dir: {
        pages: 'routes',
    },
    components: [
        {
            path: '~/components/shared',
            extensions: ['.vue'],
            prefix: 'Shared',
        },
        {
            path: '~/components/features',
            extensions: ['.vue'],
            prefix: 'Feature',
        },
        {
            path: '~/components/entities',
            extensions: ['.vue'],
            prefix: 'Entity',
        },
        {
            path: '~/components/widgets',
            extensions: ['.vue'],
            prefix: 'Widget',
        },
        {
            path: '~/components/pages',
            extensions: ['.vue'],
            prefix: 'Page',
        },
    ],
    css: ['@/assets/styles/index.less'],
    modules: [
        '@nuxtjs/sitemap',
        '@nuxt/eslint',
        '@nuxtjs/google-fonts',
        '@hypernym/nuxt-anime',
        '@vue-final-modal/nuxt',
        '@pinia/nuxt',
        '@vueuse/nuxt',
        'nuxt-time',
    ],
    vite: {
        build: {
            assetsInlineLimit: 0,
            target: ['es2015'],
        },
    },
    features: {
        inlineStyles: true,
    },
    anime: {
        composables: true,
    },
    app: {
        baseURL: '/',
        head: {
            viewport: 'width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no',
        },
        pageTransition: {
            name: 'page',
            mode: 'out-in',
        },
        layoutTransition: {
            name: 'page',
            mode: 'out-in',
        },
    },
    runtimeConfig: {
        public: {
            apiBase: 'http://localhost:8080',
        },
    },
    site: {
        url: 'https://room.neurochar.ru',
        name: 'Neurochar',
    },
    experimental: {
        entryImportMap: false,
        emitRouteChunkError: 'manual',
    },
    googleFonts: {
        families: {
            //'Arsenal SC': [400],
        },
    },
});
