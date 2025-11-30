<script setup lang="ts">
    import { nextAnimFrame } from '~/shared/helpers/functions';
    import { useInitAppProvider } from './model/hooks/hooks';
    import type { IModalStorage } from './model/types/types';

    const appProviderStore = useInitAppProvider();

    const appTitle = useState('appTitle', () => appProviderStore.title);

    const route = useRoute();

    useHead({
        htmlAttrs: {
            lang: 'ru',
        },
        titleTemplate: (titleChunk) => {
            return titleChunk ? `${titleChunk}` : toValue(appTitle);
        },
        link: [
            // --- Стандартные favicon ---
            { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
            { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
            { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
            { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
            { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/favicon-96x96.png' },
            { rel: 'icon', type: 'image/png', sizes: '60x60', href: '/favicon-60x60.png' },
            { rel: 'icon', type: 'image/png', sizes: '72x72', href: '/favicon-72x72.png' },
            { rel: 'icon', type: 'image/png', sizes: '76x76', href: '/favicon-76x76.png' },
            { rel: 'icon', type: 'image/png', sizes: '57x57', href: '/favicon-57x57.png' },
            { rel: 'icon', type: 'image/png', sizes: '70x70', href: '/favicon-70x70.png' },

            // --- Apple Touch Icon ---
            { rel: 'apple-touch-icon', sizes: '114x114', href: '/favicon-114x114.png' },
            { rel: 'apple-touch-icon', sizes: '120x120', href: '/favicon-120x120.png' },
            { rel: 'apple-touch-icon', sizes: '128x128', href: '/favicon-128x128.png' },
            { rel: 'apple-touch-icon', sizes: '144x144', href: '/favicon-144x144.png' },
            { rel: 'apple-touch-icon', sizes: '150x150', href: '/favicon-150x150.png' },
            { rel: 'apple-touch-icon', sizes: '152x152', href: '/favicon-152x152.png' },
            { rel: 'apple-touch-icon', sizes: '180x180', href: '/favicon-180x180.png' },

            // --- PWA ---
            { rel: 'manifest', href: '/manifest.json' },

            // --- MS Tiles ---
            { rel: 'msapplication-config', href: '/browserconfig.xml' },
            { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/favicon-192x192.png' },
            { rel: 'icon', type: 'image/png', sizes: '310x310', href: '/favicon-310x310.png' },
            { rel: 'icon', type: 'image/png', sizes: '384x384', href: '/favicon-384x384.png' },
            { rel: 'icon', type: 'image/png', sizes: '512x512', href: '/favicon-512x512.png' },
        ],
    });

    if (import.meta.client) {
        const scrollingElement = (document.scrollingElement || document.documentElement) as HTMLElement;

        if (scrollingElement) {
            scrollingElement.classList.add('scrolling_element');
            if (scrollingElement.nodeName != 'HTML') {
                document.documentElement.classList.add('no_scrolling_element');
            }
        }
    }

    useState<IModalStorage[]>('appModalsStorage', () => []);

    useState('appLayoutChangedTimes', () => 0);

    const appLayoutChangedNextSkip = useState('appLayoutChangedNextSkip', () => false);

    useNuxtApp().hook('page:start', () => {
        if (appLayoutChangedNextSkip.value) {
            appLayoutChangedNextSkip.value = false;
            return;
        }
        const main = document.getElementsByTagName('main')[0];
        if (main) {
            main.style.setProperty('min-height', `${main.offsetHeight}px`);
            main.style.setProperty('overflow', 'hidden');
        }
    });

    useNuxtApp().hook('page:transition:finish', () => {
        nextAnimFrame(() => {
            if (route.hash.length === 0) {
                window.scrollTo({ top: -100 });
            }
            nextAnimFrame(() => {
                const main = document.getElementsByTagName('main')[0];
                if (main) {
                    main.style.removeProperty('min-height');
                    main.style.removeProperty('overflow');
                }
            });
        });
    });

    const isPageLoading = useState<boolean>('isPageLoading', () => false);

    let isLoadingInterval: ReturnType<typeof setTimeout> | null = null;

    useNuxtApp().hook('page:loading:start', () => {
        if (isLoadingInterval) {
            clearInterval(isLoadingInterval);
        }
        isLoadingInterval = setTimeout(() => {
            isPageLoading.value = true;
        }, 1000);
    });

    useNuxtApp().hook('page:loading:end', () => {
        if (isLoadingInterval) {
            clearInterval(isLoadingInterval);
        }
        isPageLoading.value = false;
    });

    onMounted(() => {
        const scrollElement = (document.scrollingElement || document.documentElement) as HTMLElement;
        const scrollbarWidth = window.innerWidth - scrollElement.clientWidth;
        if (scrollbarWidth > 0) {
            document.documentElement.style.setProperty('--modal-content-margin-right', `${scrollbarWidth}px`);
        }
    });
</script>

<template>
    <slot />
</template>
