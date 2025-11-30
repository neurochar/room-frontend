<script setup lang="ts">
    import IMask, { type FactoryArg } from 'imask';

    const slots = useSlots();

    const vModel = defineModel<string>({ default: '' });
    const props = defineProps<{
        type?: 'text' | 'password' | 'number';
        name?: string;
        min?: number;
        max?: number;
        step?: number;
        required?: boolean;
        mask?: FactoryArg;
        maskUnlazyOnFocus?: boolean;
        isError?: boolean;
    }>();

    const emit = defineEmits(['maskComplete', 'maskAccept']);

    const isSlotPlaceholder = Boolean(slots['placeholder']);

    const inputRef = ref<HTMLInputElement | null>(null);
    let maskObject: ReturnType<typeof IMask> | null = null;
    const inputValue = ref<string | number>(vModel.value);

    const maskIsComplete = ref(false);
    const maskRawInputValue = ref('');

    const isFocused = ref(false);

    const renderInput = ref(true);

    onMounted(() => {
        if (inputRef.value) {
            if (props.mask) {
                maskObject = IMask(inputRef.value, props.mask);
                maskObject.on('accept', () => {
                    if (!maskObject) return;
                    maskIsComplete.value = false;
                    maskRawInputValue.value = maskObject.rawInputValue;
                    inputValue.value = maskObject.value;
                    emit('maskAccept');
                });
                maskObject.on('complete', () => {
                    if (!maskObject) return;
                    maskIsComplete.value = true;
                    maskRawInputValue.value = maskObject.rawInputValue;
                    inputValue.value = maskObject.value;
                    emit('maskComplete');
                });
                maskIsComplete.value = maskObject.masked.isComplete;
                maskRawInputValue.value = maskObject.rawInputValue;

                if (props.maskUnlazyOnFocus) {
                    inputRef.value.addEventListener(
                        'focus',
                        function () {
                            if (!maskObject) return;
                            maskObject.updateOptions({ lazy: false });
                        },
                        true,
                    );
                    inputRef.value.addEventListener(
                        'blur',
                        function () {
                            if (!maskObject) return;
                            maskObject.updateOptions({ lazy: true });
                        },
                        true,
                    );
                }
            }
        }
    });

    watch(vModel, (newValue) => {
        if (skipVModelUpd) return;
        if (maskObject) {
            maskObject.value = newValue;
        } else {
            inputValue.value = newValue.toString();
        }
    });

    let skipVModelUpd = false;

    const onChanged = () => {
        skipVModelUpd = true;
        vModel.value = inputValue.value.toString();
        if (props.type === 'number' && inputValue.value === '') {
            vModel.value = '';
            renderInput.value = false;
        }
        nextTick(() => {
            skipVModelUpd = false;
            if (props.type === 'number' && inputValue.value === '') {
                renderInput.value = true;
            }
        });
    };

    watch(inputValue, (newValue) => {
        onChanged();
    });

    const isEmpty = computed(() => {
        return inputValue.value.toString().length === 0;
    });

    onUnmounted(() => {
        if (maskObject) {
            maskObject.destroy();
        }
    });

    defineExpose({
        inputRef,
    });
</script>

<template>
    <div :class="$style.wrapper">
        <template v-if="mask">
            <input
                ref="inputRef"
                :value="inputValue.toString()"
                :type="!type ? 'text' : type"
                :name="name"
                :class="[
                    $style.input,
                    isEmpty ? $style.empty : $style.not_empty,
                    isError || (!isFocused && maskRawInputValue.length > 0 && maskIsComplete === false) ? 'ui_red_border' : false,
                ]"
                @focus="isFocused = true"
                @blur="isFocused = false"
            />
        </template>
        <template v-else>
            <input
                v-if="renderInput"
                ref="inputRef"
                v-model="inputValue"
                :type="!type ? 'text' : type"
                :name="name"
                :min="min"
                :max="max"
                :step="step"
                :class="[$style.input, isEmpty ? $style.empty : $style.not_empty, isError ? 'ui_red_border' : false]"
                @focus="isFocused = true"
                @blur="
                    isFocused = false;
                    onChanged();
                "
            />
        </template>
        <template v-if="isSlotPlaceholder">
            <label :class="$style.placeholder"><slot name="placeholder" /></label>
        </template>
    </div>
</template>

<style lang="less" module>
    @import '@styles/includes';

    .wrapper {
        position: relative;
        font-size: 0;

        > .input {
            background: var(--ui-bg-color);
            height: 60px;
            width: 100%;
            border: 1px solid var(--ui-border-color);
            border-radius: 30px;
            padding: 0 20px;
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
        }

        > .placeholder {
            position: absolute;
            left: 20px;
            max-width: calc(100% - 40px);
            top: 50%;
            font-size: 19px;
            transform: translateY(-50%);
            color: var(--ui-placeholder-color);
            pointer-events: none;

            > span {
                color: var(--color-stable-red);
            }
        }

        .width-size-sm-less({
            > .input {
                height:40px;
                border-radius: 20px;
                padding:0 15px;
                font-size:16px;
            }

            > .placeholder {
                left:15px;
                max-width: calc(100% - 30px);
                font-size:16px;
            }
        });
    }

    .input:focus + .placeholder {
        opacity: 0;
        visibility: hidden;
    }

    .input.not_empty + .placeholder {
        opacity: 0;
        visibility: hidden;
    }
</style>
