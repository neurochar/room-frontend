import { defineStore } from 'pinia';

interface IAppProviderStore {
    title: string;
}

export function initAppProviderStoreValues() {
    const config: IAppProviderStore = {
        title: 'Neurochar',
    };

    return config;
}

export const useAppProviderStore = defineStore('appProviderStore', {
    state: initAppProviderStoreValues,
    actions: {},
});
