<script setup lang="ts">
    const vModel = defineModel<boolean | (number | string)[]>({ required: true });

    const props = withDefaults(
        defineProps<{
            value?: number | string;
            variant?: 'add' | 'select' | 'custom';
            textSelected?: string;
            textNone?: string;
        }>(),
        {
            value: undefined,
            variant: 'select',
            textSelected: '',
            textNone: '',
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
        <span :class="$style.icon"></span>
        <span :class="$style.text">
            <template v-if="isSelected">
                <template v-if="variant === 'select'">Выбрано</template>
                <template v-else-if="variant === 'add'">Добавлено</template>
                <template v-else-if="variant === 'custom'">{{ textSelected }}</template>
            </template>
            <template v-else>
                <template v-if="variant === 'select'">Выбрать</template>
                <template v-else-if="variant === 'add'">Добавить</template>
                <template v-else-if="variant === 'custom'">{{ textNone }}</template>
            </template>
        </span>
    </button>
</template>

<style lang="less" module>
    @import '@styles/includes';

    .wrapper {
        display: inline-flex;
        position: relative;
        box-sizing: border-box;
        border-radius: 20px;
        padding: 5px;
        gap: 10px;
        align-items: center;
        background-color: var(--color-3);
        transition: background-color 0.25s ease;

        > .icon {
            flex-shrink: 0;
            display: block;
            height: 30px;
            width: 30px;
            border-radius: 100%;
            background-color: var(--stable-white-color);
            position: relative;

            &::after {
                content: '';
                display: block;
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                opacity: 0;
                transition: opacity 0.25s ease;
                background-color: var(--color-1);
                mask: url('@/assets/icons/ui/selected.svg') no-repeat center center;
                mask-size: 16px auto;
            }
        }

        > .text {
            width: 90px;
            display: block;
            font-size: 18px;
            line-height: 1;
            font-weight: bold;
            color: var(--color-1);
            transition: color 0.25s ease;
        }

        &:focus-visible {
            box-shadow: 0px 0px 3px 2px rgba(21, 93, 253, 0.5);
        }

        &.selected {
            background-color: var(--color-1);

            > .icon {
                &::after {
                    opacity: 1;
                }
            }

            > .text {
                color: var(--stable-white-color);
            }
        }

        &.add {
            > .text {
                width: 105px;
            }
        }

        &.custom {
            > .text {
                width: max-content;
                padding-right: 5px;
            }
        }

        .width-size-sm-less({
            gap:5px;

            > .icon {
                zoom: 0.75;
            }

            > .text {
                font-size: 14px;
                width: 70px;
            }

            &.add {
                > .text {
                    width: 80px;
                }
            }
        });
    }
</style>
