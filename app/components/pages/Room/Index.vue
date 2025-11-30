<script setup lang="ts">
    const props = defineProps<{
        id: string;
    }>();

    useSeoMeta({
        title: 'Персональная комната',
    });
</script>

<template>
    <div :class="$style.block_main">
        <FeatureTesting :id="id" />
    </div>
</template>

<style lang="less" module>
    @import '@styles/includes';

    .block_main {
        .std-wrapper();
    }
</style>
