<script setup lang="ts">
import { elementAnimate, nextAnimFrame } from '~/shared/helpers/functions';

const slots = useSlots();

const styles = useCssModule();

defineProps<{ visiblileClass?: string }>();

const slotsItems = computed<string[]>(() => {
    const result: string[] = [];
    for (const slot in slots) {
        if (slot.substring(0, 5) == 'item-') {
            result.push(slot);
        }
    }
    return result;
});

const contentRef = useTemplateRef('contentRef');

const vModel = defineModel<string>({ default: '' });

const tapOpened = ref(vModel.value);

const anyOpened = ref(false);

watch(vModel, (value) => {
    tapOpened.value = value;
});

const isAnimating = ref(false);

const hideTab = async (name: string, isAnimate: boolean = false) => {
    return new Promise<void>((resolve) => {
        if (!contentRef.value) {
            resolve();
            return;
        }
        const tab = contentRef.value.querySelector<HTMLElement>(`[data-name="${name}"]`);
        if (!tab) {
            resolve();
            return;
        }

        if (!isAnimate) {
            tab.classList.remove(styles['anim_start']);
            tab.classList.remove(styles['anim_end']);
            resolve();
        } else {
            elementAnimate(tab, {
                transition: 'opacity 0.15s ease, filter 0.15s ease',
                properties: {
                    opacity: `0.5`,
                    //transform: `scale(1.1)`,
                    filter: `blur(10px)`,
                },
            }).then((clear) => {
                tab.classList.remove(styles['anim_start']);
                tab.classList.remove(styles['anim_end']);
                clear();
                resolve();
            });
        }
    });
};

const showTab = async (name: string, isAnimate: boolean = false) => {
    return new Promise<void>((resolve) => {
        if (!contentRef.value) {
            resolve();
            return;
        }
        const tab = contentRef.value.querySelector<HTMLElement>(`[data-name="${name}"]`);
        if (!tab) {
            resolve();
            return;
        }

        if (!isAnimate) {
            tab.classList.add(styles['anim_start']);
            tab.classList.add(styles['anim_end']);
            resolve();
        } else {
            tab.classList.add(styles['anim_start']);
            nextAnimFrame(() => {
                contentRef.value!.style.removeProperty(`height`);
                elementAnimate(tab, {
                    transition: 'opacity 0.25s ease, filter 0.25s ease',
                    properties: {
                        opacity: `1`,
                        //transform: `scale(1)`,
                        filter: `blur(0px)`,
                    },
                }).then((clear) => {
                    tab.classList.add(styles['anim_end']);
                    clear();
                    resolve();
                });
            });
        }
    });
};

onMounted(() => {
    watch(tapOpened, async (value, oldValue) => {
        isAnimating.value = true;
        vModel.value = value;
        if (value && oldValue) {
            if (!contentRef.value) {
                return;
            }
            anyOpened.value = true;
            const height = contentRef.value.getBoundingClientRect().height.toFixed(2);
            contentRef.value.style.setProperty(`height`, `${height}px`);
            await hideTab(oldValue, true);
            await showTab(value, true);
        } else if (value && !oldValue) {
            anyOpened.value = true;
            await showTab(value, true);
        } else if (!value && oldValue) {
            await hideTab(oldValue, true);
            anyOpened.value = false;
        }
        isAnimating.value = false;
    });

    if (tapOpened.value) {
        showTab(tapOpened.value, false);
        anyOpened.value = true;
    }
});
</script>

<template>
    <div
        ref="wrapperRef"
        :class="[$style.wrapper, anyOpened ? visiblileClass : false]"
    >
        <div
            ref="contentRef"
            :class="$style.content"
        >
            <template
                v-for="name in slotsItems"
                :key="name"
            >
                <div :data-name="name"><slot :name="name"></slot></div>
            </template>
        </div>
    </div>
</template>

<style lang="less" module>
@import '@styles/includes';

.wrapper {
}

.content {
    > div {
        display: none;

        &.anim_start {
            display: block;
            opacity: 0.5;
            //transform: scale(1.1);
            filter: blur(10px);

            &.anim_end {
                opacity: 1;
                //transform: scale(1);
                filter: blur(0px);
            }
        }
    }
}
</style>
