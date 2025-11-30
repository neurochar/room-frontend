<script setup lang="ts"></script>

<template>
    <div :class="$style.block_main">Для работы в комнате требуется указать ID в URL</div>
</template>

<style lang="less" module>
    @import '@styles/includes';

    .block_main {
        .std-wrapper();
    }
</style>
