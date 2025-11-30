<script setup lang="ts">
    const props = defineProps<{
        recountOnInit?: boolean;
        maxWidth?: number;
        maxHeight?: number;
        mode?: 'maxByContainer' | 'maxByContent';
    }>();

    const scrollBoxRef = useTemplateRef('scrollBox');
    const scrollBoxCRef = useTemplateRef('scrollBoxC');
    const scrollBoxWRef = useTemplateRef('scrollBoxW');
    const scrollerRef = useTemplateRef('scroller');
    const scrollerCRef = useTemplateRef('scrollerC');
    const scrollSlotRef = useTemplateRef('scrollSlot');

    const scrollWidth = ref('auto');

    const recountSizes = async () => {
        scrollWidth.value = 'auto';
        await nextTick();

        if (props.maxWidth !== undefined) {
            scrollWidth.value = `${props.maxWidth}px`;
        } else {
            if (props.mode === 'maxByContent') {
                if (!scrollSlotRef.value) return;
                scrollWidth.value = `${scrollSlotRef.value.offsetWidth}px`;
            } else {
                if (!scrollBoxRef.value) return;
                scrollWidth.value = `${scrollBoxRef.value.offsetWidth}px`;
            }
        }
    };

    const recountScroller = () => {
        if (!scrollBoxCRef.value || !scrollBoxWRef.value || !scrollerRef.value || !scrollSlotRef.value) return;
        if (scrollSlotRef.value.offsetHeight === 0) return;

        let p = Math.round((scrollBoxWRef.value.offsetHeight / scrollBoxWRef.value.scrollHeight) * 100);
        if (p < 20) {
            p = 20;
        } else if (p > 100) {
            p = 100;
        }
        scrollerRef.value.style.height = `${p}%`;
        countScrollerPosition();
    };

    const scrollerTP = ref(0);

    const countScrollerPosition = () => {
        if (!scrollerCRef.value || !scrollerRef.value || !scrollBoxWRef.value) return;
        const max_h = scrollerCRef.value.offsetHeight - scrollerRef.value.offsetHeight;
        scrollerTP.value = Math.round((scrollBoxWRef.value.scrollTop / (scrollBoxWRef.value.scrollHeight - scrollBoxWRef.value.offsetHeight)) * max_h);
        scrollerRef.value.style.top = `${scrollerTP.value}px`;
    };

    const countScrollerPositionByTP = () => {
        if (!scrollerCRef.value || !scrollerRef.value || !scrollBoxWRef.value) return;
        const pr = scrollerTP.value / (scrollerCRef.value.offsetHeight - scrollerRef.value.offsetHeight);
        scrollBoxWRef.value.scrollTop = Math.round((scrollBoxWRef.value.scrollHeight - scrollBoxWRef.value.offsetHeight) * pr);
        scrollerRef.value.style.top = `${scrollerTP.value}px`;
    };

    const mouseMoving = ref(false);
    const noSel = ref(false);
    const mouseMovingCoords = [0, 0];

    const scrollerTouchStart = (e: MouseEvent | TouchEvent) => {
        mouseMoving.value = true;
        if (e instanceof MouseEvent) {
            mouseMovingCoords[0] = e.pageX;
            mouseMovingCoords[1] = e.pageY;
        } else {
            const touch = e.touches[0] || e.changedTouches[0];
            if (!touch) return;
            mouseMovingCoords[0] = touch.pageX;
            mouseMovingCoords[1] = touch.pageY;
        }
        noSel.value = true;
    };

    const scrollerTouchMove = (e: MouseEvent | TouchEvent) => {
        if (!scrollerCRef.value || !scrollerRef.value) return;
        if (mouseMoving.value) {
            let pageY = 0;
            if (e instanceof MouseEvent) {
                pageY = e.pageY;
            } else {
                const touch = e.touches[0] || e.changedTouches[0];
                if (!touch) return;
                pageY = touch.pageY;
            }
            const dY = pageY - mouseMovingCoords[1]!;
            mouseMovingCoords[1] = pageY;

            let tp = scrollerTP.value + dY;
            const max_h = scrollerCRef.value.offsetHeight - scrollerRef.value.offsetHeight;

            if (tp < 0) {
                tp = 0;
            } else if (tp > max_h) {
                tp = max_h;
            }

            scrollerTP.value = tp;
            countScrollerPositionByTP();
        }
    };

    const scrollerTouchEnd = () => {
        noSel.value = false;
        nextTick(() => {
            mouseMoving.value = false;
        });
    };

    const recount = async () => {
        await recountSizes();
        recountScroller();
    };

    defineExpose({
        recount,
    });

    onMounted(() => {
        if (props.recountOnInit !== false) {
            recount();
        }

        if (scrollBoxWRef.value) {
            scrollBoxWRef.value.addEventListener('scroll', countScrollerPosition);
        }
        if (scrollerRef.value) {
            scrollerRef.value.addEventListener('mousedown', scrollerTouchStart);
        }
        if (scrollerRef.value) {
            scrollerRef.value.addEventListener('touchstart', scrollerTouchStart);
        }
        document.addEventListener('mouseup', scrollerTouchEnd);
        document.addEventListener('blur', scrollerTouchEnd);
        document.addEventListener('touchend', scrollerTouchEnd);
        document.addEventListener('mousemove', scrollerTouchMove);
        document.addEventListener('touchmove', scrollerTouchMove);
    });

    onUnmounted(() => {
        if (scrollBoxWRef.value) {
            scrollBoxWRef.value.removeEventListener('scroll', countScrollerPosition);
        }
        if (scrollerRef.value) {
            scrollerRef.value.removeEventListener('mousedown', scrollerTouchStart);
        }
        if (scrollerRef.value) {
            scrollerRef.value.removeEventListener('touchstart', scrollerTouchStart);
        }
        document.removeEventListener('mouseup', scrollerTouchEnd);
        document.removeEventListener('blur', scrollerTouchEnd);
        document.removeEventListener('touchend', scrollerTouchEnd);
        document.removeEventListener('mousemove', scrollerTouchMove);
        document.removeEventListener('touchmove', scrollerTouchMove);
    });
</script>

<template>
    <div
        ref="scrollBox"
        :class="[$style.scroll_box, noSel ? $style.no_sel : false]"
        :style="{ width: scrollWidth }"
    >
        <div
            ref="scrollBoxW"
            :class="$style.scroll_box_w"
            :style="{
                maxHeight: maxHeight ? `${maxHeight}px` : 'auto',
            }"
        >
            <div
                ref="scrollBoxC"
                :class="$style.scroll_box_c"
            >
                <div
                    ref="scrollSlot"
                    :class="$style.scroll_slot"
                    :style="{ width: scrollWidth }"
                >
                    <slot />
                </div>
            </div>
        </div>
        <div :class="$style.scroller_w">
            <div
                ref="scrollerC"
                :class="$style.scroller_c"
            >
                <div
                    ref="scroller"
                    :class="$style.scroller"
                ></div>
            </div>
        </div>
    </div>
</template>

<style lang="less" module>
    @import '@styles/includes';

    .scroll_box {
        overflow: hidden;
        position: relative;

        &.no_sel {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
        }

        > .scroll_box_w {
            overflow-y: scroll;
            width: 9999px;
            width: calc(100% + 30px);
            -webkit-overflow-scrolling: touch;

            > .scroll_box_c {
                display: flex;

                > .scroll_slot {
                    //max-width: 100%;
                    //overflow: hidden;
                }
            }
        }

        > .scroller_w {
            position: absolute;
            top: 0;
            right: 0;
            z-index: 1000;
            width: 12px;
            height: 100%;

            > .scroller_c {
                position: absolute;
                top: 4px;
                right: 4px;
                width: 8px;
                height: 100%;
                height: calc(100% - 8px);

                > .scroller {
                    position: absolute;
                    top: 0;
                    height: 20%;
                    width: 8px;
                    background: var(--color-1);
                    opacity: 0.5;
                    border-radius: 5px;
                    cursor: pointer;
                }
            }
        }
    }
</style>
