import { useAsyncData, type AsyncDataOptions, type NuxtError } from '#app';
import { reactiveComputed } from '@vueuse/core';
import { computed, reactive, type UnwrapNestedRefs } from 'vue';

type PartialUndef<T> = { [P in keyof T]: T[P] | undefined };

type MergedAsyncReturn<T> = {
    error: Ref<NuxtError | null>;
    data: UnwrapNestedRefs<PartialUndef<T>>;
    isFetching: Ref<boolean>;
    isAllDefined: Ref<boolean>;
};

export function useMergedData<F extends Record<string, () => Promise<any>>>(
    keyPrefix: string,
    fetchers: F,
    makeRefetch: boolean = true,
    fetchOptions: AsyncDataOptions<unknown> = {},
): MergedAsyncReturn<{ [K in keyof F]: Awaited<ReturnType<F[K]>> }> {
    const options: AsyncDataOptions<unknown> = { lazy: true, ...fetchOptions };

    if (!makeRefetch) {
        options.getCachedData = (key, nuxtApp) => {
            const cached = nuxtApp.payload.data[key] ?? nuxtApp.static.data[key];
            return cached === undefined ? undefined : cached;
        };
    } else {
        options.getCachedData = undefined;
    }

    const asyncResults = reactive({
        ...Object.fromEntries(
            Object.keys(fetchers).map((k) => [
                k,
                useAsyncData<Awaited<ReturnType<F[typeof k]>>>(
                    `${keyPrefix}:${k}`,
                    fetchers[k]!,
                    options as AsyncDataOptions<Awaited<ReturnType<F[typeof k]>>>,
                ),
            ]),
        ),
    }) as {
        [K in keyof F]: ReturnType<typeof useAsyncData<Awaited<ReturnType<F[K]>>>>;
    };

    const isAllDefined = computed(() => {
        for (const k in asyncResults) {
            if (asyncResults[k].data.value === undefined) return false;
        }
        return true;
    });

    const error = computed<NuxtError | null>(() => {
        for (const k in asyncResults) {
            const err = asyncResults[k].error.value;
            if (err) return err;
        }
        return null;
    });

    const isFetching = computed(() => {
        for (const k in asyncResults) {
            if (asyncResults[k].status.value === 'pending') return true;
        }
        return false;
    });

    type TAll = { [K in keyof F]: Awaited<ReturnType<F[K]>> };
    const data = reactiveComputed<PartialUndef<TAll>>(() => {
        return Object.keys(asyncResults).reduce((acc, k) => {
            const key = k as keyof F;
            acc[key] = asyncResults[key].data.value;
            return acc;
        }, {} as PartialUndef<TAll>);
    });

    return { data, isAllDefined, error, isFetching };
}
