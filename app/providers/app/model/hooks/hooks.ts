import { useAppProviderStore } from '../store/store';

export function useInitAppProvider() {
    const appProviderStore = useAppProviderStore();

    return appProviderStore;
}

export function useAppProviderConfig() {
    const appProviderStore = useAppProviderStore();

    return readonly(reactive(storeToRefs(appProviderStore)));
}
