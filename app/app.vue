<script setup lang="ts">
    import { ModalsContainer } from 'vue-final-modal';
    import { AppProvider } from './providers/app';
</script>

<template>
    <AppProvider>
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
        <ModalsContainer />
    </AppProvider>
</template>
