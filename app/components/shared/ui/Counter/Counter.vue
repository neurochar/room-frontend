<script setup lang="ts">
    const vModel = defineModel<number>({ default: 0 });

    defineProps<{ postfix?: string }>();

    const emit = defineEmits(['modelUpdate']);

    watch(vModel, (value) => {
        emit('modelUpdate', value);
    });

    const incr = () => {
        vModel.value += 1;
    };

    const decr = () => {
        if (vModel.value > 0) {
            vModel.value -= 1;
        }
    };
</script>

<template>
    <div :class="$style.wrapper">
        <button
            type="button"
            :class="$style.button"
            title="Убрать"
            @click="decr"
        >
            -
        </button>
        <div :class="[$style.value, vModel > 0 ? $style.not_null : false]">
            <span
                >{{ vModel }}<template v-if="postfix">&nbsp;{{ postfix }}</template></span
            >
        </div>
        <button
            type="button"
            :class="$style.button"
            title="Добавить"
            @click="incr"
        >
            +
        </button>
    </div>
</template>

<style lang="less" module>
    @import '@styles/includes';

    .wrapper {
        display: inline-flex;
        background-color: var(--body-bg-color);
        padding: 4px;
        border-radius: 20px;
    }

    .value {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 5px;
        font-size: 24px;
        font-weight: bold;

        > span {
            display: block;
            min-width: 70px;
            text-align: center;
        }

        &.not_null {
            color: var(--color-1);
        }
    }

    .button {
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
        width: 30px;
        height: 30px;
        border-radius: 100%;
        background-color: var(--color-3);
        font-size: 24px;
        border-radius: 100px;
    }

    .width-size-sm-less({
        .value {
            font-size: 19px;
        }
    });
</style>
