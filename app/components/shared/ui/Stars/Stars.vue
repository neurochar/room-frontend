<script setup lang="ts">
const vModel = defineModel<number>({ default: 0 });

const props = defineProps<{
    count: number;
}>();
</script>

<template>
    <div :class="$style.wrapper">
        <template
            v-for="i in props.count"
            :key="i"
        >
            <button
                type="button"
                :class="[$style.star, vModel >= i ? $style.active : false]"
                @click="vModel = i"
            ></button>
        </template>
    </div>
</template>

<style lang="less" module>
@import '@styles/includes';

.wrapper {
    display: inline-flex;
    gap: 10px;
}

.star {
    width: 24px;
    height: 23px;
    mask-image: url('@/assets/icons/star_empty.svg');
    mask-size: cover;
    background-color: var(--color-1);
    transition: background-color 0.3s ease;

    .hover({
        background-color: var(--color-1-hover);
    });

    &.active {
        mask-image: url('@/assets/icons/star_full.svg');
    }
}

.width-size-sm-less({
    //
});
</style>
