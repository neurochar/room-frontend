<script setup lang="ts" generic="T = any">
    import { elementAnimate } from '~/shared/helpers/functions';
    import Scrollbox from '../Scrollbox/Scrollbox.vue';
    import type { ISelectPrepOption, ISelectProps } from './types';

    const instance = getCurrentInstance();

    const uid = ref('');

    const vModel = defineModel<string | number | null>({ default: '' });
    const props = defineProps<ISelectProps<T>>();

    const defaultMaxHeight = 41 * 8;

    const emit = defineEmits(['modelUpdate']);

    const optionsElemRef = useTemplateRef('optionsElem');
    const optionsDivElemRef = useTemplateRef('optionsDivElem');
    const mainElemRef = useTemplateRef('mainElem');
    const scrollBoxRef = useTemplateRef('scrollBox');
    const searchInputRef = useTemplateRef('searchInputRef');

    const isSearchableMode = ref(false);

    const isOpen = ref(false);
    const isOpenInit = ref(false);
    const isOpenAnimating = ref(false);
    const isOpenAndReady = ref(false);

    const optionsToTop = ref(false);
    const optionsToRight = ref(false);

    const filterValue = ref('');

    const prepOptions = computed<ISelectPrepOption<T>[]>(() => {
        return props.options.map<ISelectPrepOption<T>>((option, id) => {
            return {
                ...option,
                id: id,
            };
        });
    });

    const filteredOptions = computed<ISelectPrepOption<T>[]>(() => {
        if (props.filterFunc) {
            return props.filterFunc(filterValue.value, prepOptions.value);
        }
        return prepOptions.value;
    });

    const onSelectClick = (fromKeyboard: boolean) => {
        if (isOpenAnimating.value) return;
        isOpen.value = !isOpen.value;
        if (props.searchable) {
            isSearchableMode.value = isOpen.value;
        }
        lastChangeFromEnter = fromKeyboard;
    };

    const setIsClose = (value: boolean, fromKeyboard: boolean) => {
        if (isOpenAnimating.value) return;
        isOpen.value = value;
        lastChangeFromEnter = fromKeyboard;
    };

    const focusedOptionValue = ref<number | null>(null);

    watch(isOpen, (isOpen) => {
        if (isOpen) {
            isOpenInit.value = true;
            if (mainElemRef.value) {
                mainElemRef.value.blur();
            }

            nextTick(async () => {
                if (!optionsElemRef.value || !optionsDivElemRef.value) {
                    return;
                }
                if (scrollBoxRef.value) {
                    await scrollBoxRef.value.recount();
                }

                if (vModel.value) {
                    const selOptionElem = optionsDivElemRef.value!.querySelector<HTMLElement>(`[data-value="${vModel.value}"]`);
                    if (selOptionElem) {
                        selOptionElem.focus();
                    }
                }

                if (props.searchable) {
                    searchInputRef.value?.focus();
                }

                nextTick(() => {
                    if (!optionsElemRef.value || !optionsDivElemRef.value || !scrollBoxRef.value) {
                        return;
                    }
                    isOpenAnimating.value = true;
                    const targetHeight = scrollBoxRef.value.$el.clientHeight;

                    if (document.scrollingElement) {
                        const fullHeight = document.scrollingElement!.scrollTop + optionsElemRef.value.getBoundingClientRect().top + targetHeight;
                        if (fullHeight > document.body.scrollHeight) {
                            optionsToTop.value = true;
                        }

                        if (props.maxOptionsWidth !== undefined) {
                            const fullWidth =
                                document.scrollingElement!.scrollLeft + optionsElemRef.value.getBoundingClientRect().left + optionsElemRef.value.offsetWidth;

                            if (fullWidth > document.body.scrollWidth) {
                                optionsToRight.value = true;
                            }
                        }
                    }

                    elementAnimate(optionsElemRef.value, {
                        properties: {
                            height: `${targetHeight}px`,
                        },
                        transition: 'height 0.2s',
                    }).then((clear) => {
                        isOpenAndReady.value = true;

                        nextTick(() => {
                            clear();
                            isOpenAnimating.value = false;
                        });
                    });
                });
            });
        } else {
            if (!optionsElemRef.value || !optionsDivElemRef.value || !scrollBoxRef.value) {
                return;
            }
            isSearchableMode.value = false;
            focusedOptionValue.value = null;
            optionHighlighted.value = null;
            isOpenAndReady.value = false;
            filterValue.value = '';
            optionsElemRef.value.style.height = `${scrollBoxRef.value.$el.clientHeight}px`;
            nextTick(() => {
                isOpenAnimating.value = true;
                elementAnimate(optionsElemRef.value!, {
                    properties: {
                        height: `1px`,
                    },
                    transition: 'height 0.15s',
                }).then((clear) => {
                    isOpenInit.value = false;
                    nextTick(() => {
                        clear();
                        isOpenAnimating.value = false;
                        if (lastChangeFromEnter && mainElemRef.value) {
                            mainElemRef.value.focus();
                        }
                        optionsToTop.value = false;
                        optionsToRight.value = false;
                    });
                });
            });
        }
    });

    const nowOption = computed(() => {
        const option = prepOptions.value.find((item) => item.value === vModel.value);
        if (!option && prepOptions.value.length && !props.nullable) {
            return prepOptions.value[0]!;
        } else if (!option) {
            return null;
        }
        return option;
    });

    watch(vModel, (value) => {
        const item = prepOptions.value.find((item) => item.value === value);
        emit('modelUpdate', item || null);
    });

    const optionHighlighted = ref<number | null>(null);

    const onMouseenterOption = (id: number) => {
        const option = prepOptions.value.find((item) => item.id === id);
        if (!option) return;

        focusedOptionValue.value = null;
        optionHighlighted.value = option.id;
    };

    let lastChangeFromEnter = false;

    const selOption = (id: number, fromKeyboard: boolean) => {
        const option = prepOptions.value.find((item) => item.id === id);
        if (!option) return;
        lastChangeFromEnter = fromKeyboard;
        vModel.value = option.value;
        isOpen.value = false;
    };

    const setFocusPrev = (e: KeyboardEvent) => {
        e.preventDefault();
        if (optionHighlighted.value === null) return;
        let targetIndex;
        const nowIndex = filteredOptions.value.findIndex((option) => option.id === optionHighlighted.value);
        if (nowIndex < 0) {
            return;
        }
        if (nowIndex === 0) {
            targetIndex = filteredOptions.value.length - 1;
        } else {
            targetIndex = optionHighlighted.value - 1;
        }
        const selOptionElem = optionsDivElemRef.value!.querySelector<HTMLElement>(`[data-id="${filteredOptions.value[targetIndex]!.id}"]`);
        if (selOptionElem) {
            selOptionElem.focus();
        }
    };

    const setFocusNext = (e: KeyboardEvent) => {
        e.preventDefault();
        if (optionHighlighted.value === null) {
            return;
        }
        let targetIndex;
        const nowIndex = filteredOptions.value.findIndex((option) => option.id === optionHighlighted.value);
        if (nowIndex < 0) {
            return;
        }
        if (nowIndex === filteredOptions.value.length - 1) {
            targetIndex = 0;
        } else {
            targetIndex = optionHighlighted.value + 1;
        }
        const selOptionElem = optionsDivElemRef.value!.querySelector<HTMLElement>(`[data-id="${filteredOptions.value[targetIndex]!.id}"]`);
        if (selOptionElem) {
            selOptionElem.focus();
        }
    };

    let onOptionBlurTimeout: ReturnType<typeof setTimeout> | null = null;

    const onOptionFocus = (id: number) => {
        const option = prepOptions.value.find((item) => item.id === id);
        if (!option) return;

        focusedOptionValue.value = option.id;
        optionHighlighted.value = option.id;

        setTimeout(() => {
            if (onOptionBlurTimeout) {
                clearTimeout(onOptionBlurTimeout);
            }
        }, 1);
    };

    const onOptionBlur = () => {
        onOptionBlurTimeout = setTimeout(() => {
            focusedOptionValue.value = null;
            optionHighlighted.value = null;
        }, 100);
    };

    const onDocClick = (e: MouseEvent) => {
        if (!optionsElemRef.value || !e.target) return;
        const target = e.target as HTMLElement;
        if (
            isOpen.value &&
            !optionsElemRef.value.contains(target) &&
            (!isSearchableMode.value || (isSearchableMode.value && searchInputRef.value && !searchInputRef.value.contains(target)))
        ) {
            setIsClose(false, false);
        }
    };

    const focusLastOption = () => {
        let value = vModel.value;
        if (!value && filteredOptions.value.length) {
            value = filteredOptions.value[0]!.value;
        }
        if (value) {
            const selOptionElem = optionsDivElemRef.value!.querySelector<HTMLElement>(`[data-value="${value}"]`);
            if (selOptionElem) {
                selOptionElem.focus();
            }
        }
    };

    const onSearchKeyDownEnter = () => {
        focusLastOption();
    };

    const onSearchKeyDownUp = (e: KeyboardEvent) => {
        if (optionHighlighted.value) {
            focusLastOption();
            setFocusPrev(e);
        } else {
            focusLastOption();
        }
    };

    const onSearchKeyDownDown = (e: KeyboardEvent) => {
        if (optionHighlighted.value) {
            focusLastOption();
            setFocusNext(e);
        } else {
            focusLastOption();
        }
    };

    const onSearchClick = (e: MouseEvent) => {
        //console.log(e);
    };

    onMounted(() => {
        uid.value = instance?.uid.toString() || '';

        if (props.initValue !== undefined) {
            vModel.value = props.initValue;
        }

        document.addEventListener('mousedown', onDocClick);

        watch(
            prepOptions,
            () => {
                if (prepOptions.value.length && !props.nullable) {
                    const find = prepOptions.value.findIndex((item) => item.value === vModel.value);
                    if (find < 0) {
                        vModel.value = prepOptions.value[0]!.value;
                    }
                }
            },
            { immediate: true },
        );
    });

    onUnmounted(() => {
        document.removeEventListener('mousedown', onDocClick);
    });
</script>

<template>
    <div :class="[$style.wrapper, isOpenInit ? $style.opened : false]">
        <template v-if="isSearchableMode">
            <div :class="$style.search_input">
                <input
                    ref="searchInputRef"
                    v-model="filterValue"
                    type="text"
                    :class="$style.search_input"
                    :placeholder="searchablePlaceholder"
                    @keydown.enter="onSearchKeyDownEnter"
                    @keydown.up="onSearchKeyDownUp"
                    @keydown.down="onSearchKeyDownDown"
                    @click="onSearchClick"
                />
            </div>
        </template>
        <button
            :id="`select-${uid}`"
            ref="mainElem"
            :aria-controls="`select-${uid}-options`"
            :tabindex="isOpen ? -1 : 0"
            type="button"
            :class="$style.main"
            aria-haspopup="listbox"
            :aria-expanded="isOpenAndReady"
            @mouseup.left="onSelectClick(false)"
            @keydown.enter="onSelectClick(true)"
        >
            <span :class="$style.value">
                <template v-if="nowOption === null">
                    <slot
                        v-if="!isSearchableMode"
                        :name="`nullValue`"
                    >
                        Выберите значение...
                    </slot>
                </template>
                <template v-else>
                    <slot
                        v-if="!isSearchableMode"
                        :name="`value`"
                        :option="nowOption"
                    >
                        {{ nowOption.data }}
                    </slot>
                </template>
            </span>
            <span :class="$style.icon">&nbsp;</span>
        </button>
        <div
            ref="optionsElem"
            :class="[
                $style.options,
                !isOpenInit ? $style.hidden : false,
                isOpenAndReady ? $style.ready : false,
                maxOptionsWidth === undefined ? $style.max100 : false,
                optionsToTop ? $style.to_top : false,
                optionsToRight ? $style.to_right : false,
            ]"
            :style="{
                maxWidth: maxOptionsWidth ? `${maxOptionsWidth}px` : `auto`,
            }"
        >
            <Scrollbox
                ref="scrollBox"
                :class="$style.scroll_box"
                :recount-on-init="false"
                :mode="maxOptionsWidth === 0 ? 'maxByContent' : 'maxByContainer'"
                :max-height="maxHeight || defaultMaxHeight"
            >
                <div
                    :id="`select-${uid}-options`"
                    ref="optionsDivElem"
                    :class="$style.optionsDiv"
                    :aria-labelledby="`select-${uid}`"
                    role="listbox"
                    aria-orientation="vertical"
                    :aria-activedescendant="`select-${uid}-options-${vModel}`"
                    @keydown.up="setFocusPrev"
                    @keydown.down="setFocusNext"
                >
                    <template v-if="filteredOptions.length">
                        <template
                            v-for="option in filteredOptions"
                            :key="`${option.id}`"
                        >
                            <div
                                :id="`select-${uid}-options-${option.value}`"
                                :class="[
                                    $style.optionWrapper,
                                    vModel === option.value ? $style.sel : false,
                                    optionHighlighted === option.id ? $style.highlighted : false,
                                ]"
                                role="option"
                                :tabindex="
                                    (optionHighlighted !== null && option.id === optionHighlighted) || (optionHighlighted === null && option.value === vModel)
                                        ? 0
                                        : -1
                                "
                                :data-value="option.value"
                                :data-id="option.id"
                                :aria-selected="
                                    (optionHighlighted !== null && option.id === optionHighlighted) || (optionHighlighted === null && option.value === vModel)
                                "
                                @focus="onOptionFocus(option.id)"
                                @mouseenter="onMouseenterOption(option.id)"
                                @click="selOption(option.id, false)"
                                @keydown.enter="selOption(option.id, true)"
                                @blur="onOptionBlur"
                            >
                                <slot
                                    :name="`option`"
                                    :option="option"
                                >
                                    <span :class="$style.option">{{ option.data }}</span>
                                </slot>
                            </div>
                        </template>
                    </template>
                    <template v-else>
                        <slot :name="`notFound`"><div :class="$style.options_not_found">Ничего не найдено</div></slot></template
                    >
                </div>
            </Scrollbox>
        </div>
    </div>
</template>

<style lang="less" module>
    @import '@styles/includes';

    .wrapper {
        position: relative;

        > .main {
            position: relative;
            z-index: 3;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: var(--ui-bg-color);
            height: 60px;
            width: 100%;
            overflow: hidden;
            border: 1px solid var(--ui-border-color);
            border-radius: 30px;
            box-sizing: border-box;
            font-size: 19px;
            text-decoration: none !important;
            outline: none !important;
            box-shadow: inset 0px 0px 5px rgba(0, 0, 0, 0.2);

            &:focus-visible {
                box-shadow: 0px 0px 3px 2px rgba(21, 93, 253, 0.5);
            }

            > .value {
                display: block;
                box-sizing: border-box;
                margin: 0 20px;
                width: calc(100% - 30px);
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                color: var(--ui-text-color);
            }

            > .icon {
                display: block;
                width: 20px;
                margin-right: 23px;
                flex-shrink: 0;
                position: relative;
                // background-color: #c1c0c1;
                // mask: url('@/assets/icons/ui/select_icon.svg') no-repeat center center;
                // mask-size: 12px auto;
                //opacity: 0.7;
                //transition: background-color 0.1s;

                &::after {
                    content: '';
                    display: block;
                    position: absolute;
                    width: 20px;
                    height: 12px;
                    left: calc(50% - 10px);
                    top: calc(50% - 6px);
                    background-color: #c1c0c1;
                    mask: url('@/assets/icons/ui/select_icon.svg') no-repeat center center;
                    mask-size: 20px auto;
                    mask-position: center center;
                }
            }
        }

        > .search_input {
            position: absolute;
            z-index: 4;
            width: 100%;

            > input {
                width: 100%;
                border: 1px solid transparent;
                box-sizing: border-box;
                height: 60px;
                padding: 0 62px 0 20px;
                border-radius: 30px;
                font-size: 19px;
                color: var(--ui-text-color);

                &:focus-visible {
                    box-shadow: 0px 0px 3px 2px rgba(21, 93, 253, 0.5);
                }
            }
        }

        > .options {
            position: absolute;
            z-index: 5;
            top: 100%;
            left: 0;
            height: 0;
            opacity: 0;
            box-sizing: border-box;
            background: #fff;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
            border-radius: 10px;
            overflow: hidden;

            &.max100 {
                width: 100% !important;
            }

            &.hidden {
                display: none;
            }

            &.to_top {
                top: auto;
                bottom: 100%;
            }

            &.to_right {
                left: auto;
                right: 0;
            }
        }
    }

    .scroll_box {
        min-width: 100%;
    }

    .optionsDiv {
        outline: none;
        width: 100%;
    }

    .optionWrapper {
        outline: none;
        cursor: pointer;
        width: 100%;

        > .option {
            display: block;
            width: calc(100% - 30px);
            padding: 10px 0;
            margin: 0 20px;
            box-sizing: border-box;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            color: #1f222a;
        }

        &:nth-child(odd) {
            background-color: #f1f1f1;
        }

        &.highlighted {
            position: relative;
            z-index: 10;
            box-shadow: 0px 0px 3px 2px rgba(21, 93, 253, 0.5) inset;
        }

        &.sel {
            background-color: #e0dedd !important;
        }
    }

    .options_not_found {
        width: calc(100% - 30px);
        padding: 10px 0;
        margin: 0 20px;
        color: #636b83;
        font-size: 16px;
    }

    .opened {
        > .main {
            > .icon {
                &::after {
                    transform: rotate(180deg);
                    top: calc(50% - 7px);
                }
            }
        }

        > .options {
            opacity: 1;

            &.ready {
                height: auto;
            }
        }
    }

    .width-size-sm-less({
        .wrapper {
            > .main {
                height:40px;
                border-radius: 20px;
                font-size: 16px;

                > .icon {
                    margin-right: 15px;
                    
                    &::after {
                        mask-size: 12px auto;
                    }
                }

                > .value {
                    font-size: 16px;
                }
            }

            > .search_input {
                > input {
                    height: 40px;
                    padding: 0 57px 0 15px;
                    border-radius: 20px;
                    font-size: 16px;
                }
            }
        }

        .optionWrapper {
            > .option {
                margin: 0 15px;
            }
        }

        .options_not_found {
            margin: 0 15px;
        }
    });
</style>
