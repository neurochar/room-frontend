<script setup lang="ts">
    const vModel = defineModel<boolean | (number | string)[]>({ required: true });

    const props = withDefaults(
        defineProps<{
            value?: number | string;
            variant?: 'round-1' | 'round-2' | 'switch';
        }>(),
        {
            value: undefined,
            variant: 'round-1',
        },
    );

    const isSelected = ref(false);

    const toogleSelected = () => {
        if (typeof vModel.value == 'object') {
            if (props.value === undefined) {
                return;
            }

            if (isSelected.value) {
                vModel.value = vModel.value.filter((item) => item !== props.value);
            } else {
                vModel.value = [...vModel.value, props.value];
            }
        } else {
            vModel.value = !vModel.value;
        }
    };

    watch(
        vModel,
        (value) => {
            if (typeof value == 'object') {
                let found = false;
                for (const val of value) {
                    if (val === props.value) {
                        found = true;
                        break;
                    }
                }
                isSelected.value = found;
            } else {
                isSelected.value = value;
            }
        },
        { immediate: true },
    );
</script>

<template>
    <button
        type="button"
        role="switch"
        :aria-checked="isSelected"
        :class="[$style.wrapper, $style[variant], isSelected ? $style.selected : false]"
        @click="toogleSelected"
    >
        <div></div>
    </button>
</template>

<style lang="less" module>
    @import '@styles/includes';

    .wrapper {
        display: inline-block;
        position: relative;
        box-sizing: border-box;

        &.round-1,
        &.round-2 {
            width: 24px;
            height: 24px;
            overflow: hidden;
            border-radius: 100%;
            border: 1px solid var(--ui-border-color);
            transition:
                border 0.25s ease,
                background-color 0.25s ease;

            > div {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                opacity: 0;
                //transition: opacity 0.25s ease;
                //background-color: var(--color-1);

                &::after {
                    content: '';
                    display: block;
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: var(--stable-white-color);
                    mask: url('@/assets/icons/ui/checkbox.svg') no-repeat center center;
                    mask-size: 16px auto;
                }
            }

            &.selected {
                border: 1px solid var(--color-1);
                background-color: var(--color-1);

                > div {
                    opacity: 1;
                }
            }
        }

        &.round-1 {
            background-color: var(--bg-color-1);

            &.selected {
                //background-color: var(--color-1);
            }
        }

        &.round-2 {
            background-color: var(--body-bg-color);

            &.selected {
                //background-color: var(--color-1);
            }
        }

        &.switch {
            width: 64px;
            height: 40px;
            box-sizing: border-box;
            overflow: hidden;
            border-radius: 20px;
            border: 4px solid var(--color-11);
            position: relative;
            transition: border 0.25s ease;

            > div {
                position: absolute;
                top: 6px;
                left: 5px;
                width: 20px;
                height: 20px;
                border-radius: 100%;
                background-color: var(--color-11);
                transition:
                    background-color 0.25s ease,
                    left 0.25s ease;
            }

            &.selected {
                border: 4px solid var(--color-1);

                > div {
                    left: calc(100% - 24px);
                    background-color: var(--color-1);
                }
            }
        }

        &:focus-visible {
            box-shadow: 0px 0px 3px 2px rgba(21, 93, 253, 0.5);
        }
    }
</style>
