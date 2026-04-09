import { GetDefaultHeaders } from '~/shared/api/headers';

export default defineNuxtPlugin({
    name: 'api-fetch',
    enforce: 'pre',
    async setup(nuxtApp) {
        const apiFetch = $fetch.create({
            baseURL: nuxtApp.$config.public.apiBase,
            headers: GetDefaultHeaders(undefined),
        });

        return {
            provide: {
                apiFetch,
            },
        };
    },
});
