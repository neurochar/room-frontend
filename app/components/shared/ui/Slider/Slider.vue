<script setup lang="ts">
    import { elementAnimate } from '~/shared/helpers/functions';
    import type { IProps } from './model/types/types';

    const props = defineProps<IProps>();

    const vModel = defineModel<string | number | null>({ required: true });

    const selValue = ref<string | number | null>(vModel.value);

    watch(selValue, (value) => {
        vModel.value = value;
    });

    const styles = useCssModule();

    const isInit = ref(false);

    const allItemsRef = useTemplateRef('allItems');
    const upLinerRef = useTemplateRef('upLiner');
    const upAnchorRef = useTemplateRef('upAnchor');

    const containerWidth = ref<number>(0);

    const anchorsItemsMap = new Map<number | string, number>();

    const anchorsArrayMap = ref<(string | number)[]>([]);
    const anchorsRefs = ref<HTMLElement[]>([]);

    const updateAnchors = () => {
        const arrayMap: (string | number)[] = [];

        anchorsItemsMap.clear();

        props.items.forEach((item) => {
            arrayMap.push(item.value);
            anchorsItemsMap.set(item.value, 0);
        });

        anchorsArrayMap.value = arrayMap;
    };

    const countAnchorsOffset = () => {
        if (!allItemsRef.value) return;

        const allItemsOffset = allItemsRef.value.getBoundingClientRect().left;
        const refs: HTMLElement[] = [];

        const anchors = allItemsRef.value.getElementsByClassName(styles['anchor']);
        for (let i = 0; i < anchors.length; i++) {
            refs.push(anchors[i] as HTMLElement);
            anchorsItemsMap.set(
                anchorsArrayMap.value[i]!,
                Math.round((anchors[i]!.getBoundingClientRect().left - allItemsOffset + anchors[i]!.clientWidth / 2) * 100) / 100,
            );
        }

        anchorsRefs.value = refs;
    };

    const countNearestAnchorToOffset = (): string | number => {
        let diff = Infinity;
        let result = anchorsArrayMap.value[0]!;

        anchorsItemsMap.forEach((offset, itemValue) => {
            if (Math.abs(nowOffset - offset) < diff) {
                diff = Math.abs(nowOffset - offset);
                result = itemValue;
            }
        });

        return result;
    };

    let nowOffset = 0;
    let blockAnchorOffseting = false;

    const setAnchorOffset = (offset: number) => {
        if (blockAnchorOffseting || !upLinerRef.value || !upAnchorRef.value || offset < 0 || offset > containerWidth.value) {
            return;
        }
        upLinerRef.value.style.setProperty('width', `${offset}px`);
        upAnchorRef.value.style.setProperty('left', `${offset}px`);
        nowOffset = offset;
        blockAnchorOffseting = false;
    };

    const setAnchorOffsetWithAnimate = (offset: number): Promise<void> => {
        return new Promise((resolve) => {
            if (blockAnchorOffseting || !upLinerRef.value || !upAnchorRef.value || offset < 0 || offset > containerWidth.value || offset == nowOffset) {
                resolve();
                return;
            }

            blockAnchorOffseting = true;
            elementAnimate(upLinerRef.value, {
                transition: 'width 0.3s',
                properties: {
                    width: `${offset}px`,
                },
            });

            elementAnimate(upAnchorRef.value, {
                transition: 'left 0.3s',
                properties: {
                    left: `${offset}px`,
                },
            }).then(() => {
                nowOffset = offset;
                blockAnchorOffseting = false;
                resolve();
            });
        });
    };

    const setValue = async (value: string | number) => {
        const anchorsItemValue = anchorsItemsMap.get(value);
        if (anchorsItemValue !== undefined) {
            await setAnchorOffsetWithAnimate(anchorsItemValue);
            selValue.value = value;
        }
    };

    const touchGo = ref(false);

    const touchSaveData = ref<{
        startTranslateX: number;
        touch: {
            x: number;
            y: number;
        };
        pageXdiff: number;
        pageYdiff: number;
        moveState: 'unknown' | 'ignore' | 'move';
        moveStartedDiff: number;
    }>({
        startTranslateX: 0,
        touch: {
            x: 0,
            y: 0,
        },
        pageXdiff: 0,
        pageYdiff: 0,
        moveState: 'unknown',
        moveStartedDiff: 0,
    });

    const onTouchStart = (e: TouchEvent) => {
        touchGo.value = true;
        const touch = e.touches[0] || e.changedTouches[0];
        if (!touch) {
            return;
        }
        touchSaveData.value = {
            startTranslateX: nowOffset,
            touch: {
                x: touch.pageX,
                y: touch.pageY,
            },
            pageXdiff: 0,
            pageYdiff: 0,
            moveState: 'unknown',
            moveStartedDiff: 0,
        };
    };

    const onTouchMove = (e: TouchEvent) => {
        if (!touchGo.value) {
            return;
        }

        const touch = e.touches[0] || e.changedTouches[0];
        if (!touch) {
            return;
        }
        touchSaveData.value.pageXdiff = touchSaveData.value.touch.x - touch.pageX;
        touchSaveData.value.pageYdiff = touchSaveData.value.touch.y - touch.pageY;
        if (touchSaveData.value.moveState === 'unknown') {
            if (Math.abs(touchSaveData.value.pageYdiff) > 10) {
                touchSaveData.value.moveState = 'ignore';
            }
            if (Math.abs(touchSaveData.value.pageXdiff) > 10) {
                touchSaveData.value.moveState = 'move';
                touchSaveData.value.moveStartedDiff = touchSaveData.value.pageXdiff;
            }
        }

        if (touchSaveData.value.moveState === 'move') {
            e.preventDefault();
            const newTranslateX = touchSaveData.value.startTranslateX - touchSaveData.value.pageXdiff + touchSaveData.value.moveStartedDiff;
            setAnchorOffset(newTranslateX);
        }
    };

    const onTouchEnd = () => {
        if (touchGo.value) {
            touchGo.value = false;
            if (touchSaveData.value.moveState === 'move') {
                const selectedItem = countNearestAnchorToOffset();
                const anchorsItemValue = anchorsItemsMap.get(selectedItem);
                if (anchorsItemValue !== undefined) {
                    selValue.value = selectedItem;
                    setAnchorOffsetWithAnimate(anchorsItemValue);
                }
            }
        }
    };

    let mouseXStart = 0;
    let offsetOnMouseStart = 0;

    const onClickStart = (e: MouseEvent) => {
        touchGo.value = true;
        mouseXStart = e.clientX;
        offsetOnMouseStart = nowOffset;
    };

    const onClickMove = (e: MouseEvent) => {
        if (!touchGo.value) return;
        setAnchorOffset(offsetOnMouseStart + (e.clientX - mouseXStart));
    };

    const onClickEnd = () => {
        if (!touchGo.value) return;
        touchGo.value = false;
        const selectedItem = countNearestAnchorToOffset();
        const anchorsItemValue = anchorsItemsMap.get(selectedItem);
        if (anchorsItemValue !== undefined) {
            selValue.value = selectedItem;
            setAnchorOffsetWithAnimate(anchorsItemValue);
        }
    };

    const toNext = () => {
        let newIndex = anchorsArrayMap.value.findIndex((item) => item === selValue.value);
        if (newIndex === anchorsArrayMap.value.length - 1) {
            newIndex = 0;
        } else {
            newIndex += 1;
        }
        setValue(anchorsArrayMap.value[newIndex]!);
        anchorsRefs.value[newIndex]!.focus();
    };

    const toPrev = () => {
        let newIndex = anchorsArrayMap.value.findIndex((item) => item === selValue.value);
        if (newIndex <= 0) {
            newIndex = anchorsArrayMap.value.length - 1;
        } else {
            newIndex -= 1;
        }
        setValue(anchorsArrayMap.value[newIndex]!);
        anchorsRefs.value[newIndex]!.focus();
    };

    const onWindowResize = async () => {
        if (allItemsRef.value) {
            containerWidth.value = allItemsRef.value.offsetWidth;
        }

        countAnchorsOffset();

        if (selValue.value === null) {
            return;
        }
        let anchorsItemValue = anchorsItemsMap.get(selValue.value);
        if (anchorsItemValue === undefined) {
            return;
        }

        setAnchorOffset(anchorsItemValue);

        await new Promise((r) => setTimeout(r, 100));

        countAnchorsOffset();

        anchorsItemValue = anchorsItemsMap.get(selValue.value);
        if (anchorsItemValue === undefined) {
            return;
        }

        setAnchorOffset(anchorsItemValue);
    };

    onMounted(() => {
        if (selValue.value === null && props.items.length) {
            selValue.value = props.initValue !== undefined ? props.initValue : props.items[0]!.value;
        }

        updateAnchors();
        onWindowResize();
        if (selValue.value !== null) {
            const anchorsItemValue = anchorsItemsMap.get(selValue.value);
            if (anchorsItemValue !== undefined) {
                setAnchorOffset(anchorsItemValue);
            }
        }
        isInit.value = true;

        window.addEventListener('resize', onWindowResize);
        window.addEventListener('touchend', onTouchEnd);
        window.addEventListener('mousemove', onClickMove);
        window.addEventListener('mouseup', onClickEnd);
    });

    onUnmounted(() => {
        window.removeEventListener('resize', onWindowResize);
        window.removeEventListener('touchend', onTouchEnd);
        window.removeEventListener('mousemove', onClickMove);
        window.removeEventListener('mouseup', onClickEnd);
    });
</script>

<template>
    <div :class="$style.slider_liner">
        <div :class="$style.liner"></div>
        <div
            ref="upLiner"
            :class="$style.up_liner"
        ></div>
        <div
            ref="upAnchor"
            :class="[$style.up_anchor, isInit ? $style.show : false]"
        >
            <div
                @touchstart="onTouchStart"
                @touchmove="onTouchMove"
                @mousedown="onClickStart"
            >
                <div></div>
            </div>
        </div>
        <div
            ref="allItems"
            :class="$style.all_items"
            role="toolbar"
            @keydown.right="toNext"
            @keydown.left="toPrev"
        >
            <div :class="$style.items">
                <template
                    v-for="(item, i) in props.items"
                    :key="`${i}-${item.value}`"
                >
                    <div v-if="i < props.items.length - 1">
                        <div
                            :class="$style.item"
                            :style="{ maxWidth: containerWidth ? `calc(${containerWidth}px / ${props.items.length || 1})` : `none` }"
                        >
                            <button
                                type="button"
                                :tabindex="item.value == selValue ? 0 : -1"
                                :aria-selected="item.value == selValue"
                                :class="$style.anchor"
                                @click="setValue(item.value)"
                            >
                                <div></div>
                            </button>
                            <div :class="[$style.content, item.hasTip ? $style.tiped : false]">
                                <div :class="$style.data">
                                    <div
                                        :class="$style.title"
                                        @click="setValue(item.value)"
                                    >
                                        <slot
                                            :item="item.value"
                                            name="elem"
                                            :sel="item.value == selValue"
                                        />
                                    </div>
                                    <div :class="$style.tip">
                                        <slot
                                            :item="item.value"
                                            :name="`tip`"
                                            :sel="item.value == selValue"
                                        />
                                    </div>
                                </div>
                                <template v-if="item.hasTip">
                                    <div :class="$style.tiped_data">
                                        <div
                                            :class="$style.title"
                                            @click="setValue(item.value)"
                                        >
                                            <slot
                                                :item="item.value"
                                                name="elem"
                                                :sel="item.value == selValue"
                                            />
                                        </div>
                                        <div :class="$style.tip">
                                            <slot
                                                :item="item.value"
                                                :name="`tip`"
                                                :sel="item.value == selValue"
                                            />
                                        </div>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </div>
                </template>
            </div>
            <div :class="$style.last_item">
                <div
                    :class="$style.item"
                    :style="{ maxWidth: containerWidth ? `calc(${containerWidth}px / ${props.items.length || 1})` : `none` }"
                >
                    <button
                        type="button"
                        :tabindex="props.items[props.items.length - 1]!.value == selValue ? 0 : -1"
                        :aria-selected="props.items[props.items.length - 1]!.value == selValue"
                        :class="$style.anchor"
                        @click="setValue(props.items[props.items.length - 1]!.value)"
                    >
                        <div></div>
                    </button>
                    <div :class="[$style.content, props.items[props.items.length - 1]!.hasTip ? $style.tiped : false]">
                        <div :class="$style.data">
                            <div
                                :class="$style.title"
                                @click="setValue(props.items[props.items.length - 1]!.value)"
                            >
                                <slot
                                    :item="props.items[props.items.length - 1]!.value"
                                    name="elem"
                                    :sel="props.items[props.items.length - 1]!.value == selValue"
                                />
                            </div>
                            <div :class="$style.tip">
                                <slot
                                    :item="props.items[props.items.length - 1]!.value"
                                    name="tip"
                                    :sel="props.items[props.items.length - 1]!.value == selValue"
                                />
                            </div>
                        </div>
                        <template v-if="props.items[props.items.length - 1]!.hasTip">
                            <div :class="$style.tiped_data">
                                <div
                                    :class="$style.title"
                                    @click="setValue(props.items[props.items.length - 1]!.value)"
                                >
                                    <slot
                                        :item="props.items[props.items.length - 1]!.value"
                                        name="elem"
                                        :sel="props.items[props.items.length - 1]!.value == selValue"
                                    />
                                </div>
                                <div :class="$style.tip">
                                    <slot
                                        :item="props.items[props.items.length - 1]!.value"
                                        name="tip"
                                        :sel="props.items[props.items.length - 1]!.value == selValue"
                                    />
                                </div>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="less" module>
    @import '@styles/includes';

    .slider_liner {
        position: relative;

        > .liner {
            position: relative;
            z-index: 1;
            height: 10px;
            border-radius: 10px;
            background: var(--color-2);
            box-shadow: 0px 0px 1px 0px rgba(0, 0, 0, 0.25) inset;

            .width-size-sm-less({
                //height: 6px;
            });
        }

        > .up_liner {
            position: absolute;
            top: 0;
            left: 0;
            width: 0;
            z-index: 2;
            height: 10px;
            border-radius: 10px;
            background: var(--color-1);
            box-shadow: 0px 0px 1px 0px rgba(0, 0, 0, 0.25) inset;

            .width-size-sm-less({
            //height: 6px;
        });
        }

        > .up_anchor {
            position: absolute;
            z-index: 4;
            left: 0;
            top: 0;
            opacity: 0;

            &.show {
                opacity: 1;
            }

            > div {
                position: relative;
                top: -10px;
                left: -15px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto;
                width: 30px;
                height: 30px;
                border-radius: 100%;
                background: var(--color-1);
                background: linear-gradient(90deg, var(--color-1) 50%, #e9676c 50%);
                box-shadow:
                    0px 0px 10px 0px rgba(0, 0, 0, 0.2),
                    0px 0px 5px 0px rgba(0, 0, 0, 0.1) inset;
                cursor: pointer;
                -webkit-tap-highlight-color: transparent;

                > div {
                    width: 14px;
                    height: 14px;
                    border-radius: 100%;
                    background: var(--stable-white-color);
                }
            }

            .width-size-sm-less({
            > div {
                width:30px;
                height:30px;
                top: -11px;
                left: -15px;

                > div {
                    width:8px;
                    height:8px;
                }
            }
        });
        }

        > .all_items {
            display: flex;
            top: -20px;
            position: relative;
            z-index: 3;

            > .items {
                flex-basis: 100%;
                display: flex;
                justify-content: space-between;

                > div {
                    flex: 1 1 0px;
                    flex-shrink: 0;
                    display: flex;
                }
            }

            > .last_item {
                flex-shrink: 0;
            }

            .width-size-sm-less({
            top: -15px;
        });
        }
    }

    .item {
        text-align: center;
        position: relative;

        > .anchor {
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto;
            width: 30px;
            height: 30px;
            border-radius: 100%;
            //background: var(--bg-color-white);
            //box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.1);
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;

            > div {
                width: 6px;
                height: 6px;
                border-radius: 100%;
                background: var(--stable-white-color);
                box-shadow: 0px 0px 8px 3px rgba(0, 0, 0, 0.2);
            }

            &:focus-visible {
                outline: rgba(21, 93, 253, 0.2) solid 2px;
                outline-offset: 5px;
                //box-shadow: 0px 0px 2px 1px rgba(21, 93, 253, 0.1);
            }
        }

        > .content {
            margin-top: 15px;
            width: 100%;
            position: relative;

            .title {
                cursor: pointer;
                width: 100%;
                overflow: hidden;
                word-break: break-word;
            }

            .tip {
                width: 100%;
                overflow: hidden;
                word-break: break-word;
            }

            > .data {
                width: 100%;

                > .tip {
                    height: 1px;
                    overflow: hidden;
                    opacity: 0;
                }
            }

            &.tiped {
                > .tiped_data {
                    display: none;
                    width: 100%;
                    position: absolute;
                    z-index: 1;
                    top: 0;
                    left: 0;

                    &::after {
                        content: '';
                        display: block;
                        position: absolute;
                        z-index: -1;
                        top: -10px;
                        left: -10px;
                        width: calc(100% + 20px);
                        height: calc(100% + 20px);
                        background-color: var(--bg-color-1);
                        border-radius: 10px;
                        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.25);
                    }
                }

                &:hover {
                    > .tiped_data {
                        display: block;
                    }
                }
            }
        }

        .width-size-sm-less({
        > .anchor {
            width: 20px;
            height: 20px;

            > div {
                //width:8px;
                //height:8px;
            }
        }
    });
    }
</style>
