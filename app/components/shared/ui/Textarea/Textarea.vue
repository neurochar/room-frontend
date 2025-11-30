<script setup lang="ts">
    const vModel = defineModel<string>({ default: '' });
    const props = defineProps<{
        placeholder?: string;
    }>();
</script>

<template>
    <textarea
        v-model="vModel"
        type="text"
        :class="$style.textarea"
        :placeholder="placeholder"
    />
</template>

<style lang="less" module>
    @import '@styles/includes';

    .textarea {
        background: var(--ui-bg-color);
        min-height: 100px;
        width: 100%;
        border: 1px solid var(--ui-border-color);
        border-radius: 30px;
        padding: 17px 20px;
        box-sizing: border-box;
        font-size: 19px;
        color: var(--ui-text-color);
        box-shadow: inset 0px 0px 5px rgba(0, 0, 0, 0.2);

        &::placeholder {
            color: var(--ui-placeholder-color);
            opacity: 1;
        }

        &:focus-visible {
            box-shadow: 0px 0px 3px 2px var(--ui-focus-shadow);
        }

        .width-size-sm-less({
            border-radius: 20px;
            padding:9px 15px;
            font-size:16px;
        });
    }
</style>
