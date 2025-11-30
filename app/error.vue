<script setup lang="ts">
    import type { NuxtError } from '#app';
    import { AppProvider } from './providers/app';

    defineProps({
        error: Object as () => NuxtError,
    });
</script>

<template>
    <AppProvider>
        <div :class="$style.wrapper">
            <div>
                <div :class="$style.code">{{ error && error.statusCode }}</div>
                Возникла ошибка
                <div :class="$style.back">
                    <NuxtLink
                        to="/"
                        class="button_1"
                        >На главную</NuxtLink
                    >
                </div>
            </div>
        </div>
    </AppProvider>
</template>

<style lang="less" module>
    @import '@styles/includes';

    .wrapper {
        display: flex;
        height: 100dvh;
        align-items: center;
        justify-content: center;
        font-size: 20px;

        > div {
            text-align: center;
        }
    }

    .code {
        font-size: 200px;
        font-weight: bold;
        line-height: 1;

        .width-size-sm-less({
            font-size:100px;
        });
    }

    .back {
        font-size: 0;
        margin-top: 40px;
        text-align: center;
    }
</style>
