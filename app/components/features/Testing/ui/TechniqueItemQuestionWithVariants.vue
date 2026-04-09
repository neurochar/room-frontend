<script setup lang="ts">
    import type { V1RoomTechniqueItem } from '~/api/generated/Api';
    import { openModalAlert } from '~/components/shared/modals/Alert/useModalAlert';
    import { useTestingStore } from '../model/store/store';

    defineProps<{
        techniqueItem: V1RoomTechniqueItem;
    }>();

    const store = useTestingStore();

    const value = ref<undefined | number>();

    watch(value, () => {
        if (value.value !== undefined) {
            store.setAnswer(store.data.techniqueItemCurrent, { intValue: value.value.toString() });
        } else {
            store.clearAnswer(store.data.techniqueItemCurrent);
        }
    });

    watch(
        () => store.data.techniqueItemCurrent,
        () => {
            value.value = undefined;
        },
    );

    onMounted(() => {
        const valueInStore = store.data.answers?.get(store.data.techniqueItemCurrent);
        if (valueInStore && valueInStore.intValue !== undefined) {
            value.value = Number(valueInStore.intValue);
        }
    });

    const validate = async (): Promise<boolean> => {
        if (value.value === undefined) {
            openModalAlert('Выберите вариант ответа');
            return false;
        }

        return true;
    };
</script>

<template>
    <div :class="$style.wrapper">
        <div :class="$style.block_title">Вопрос {{ store.data.techniqueItemCurrent + 1 }}.</div>
        <div :class="$style.question">{{ techniqueItem.question }}</div>
        <div :class="$style.variants">
            <div
                v-for="(variant, i) in techniqueItem.variants"
                :key="i"
            >
                <div :class="$style.radio">
                    <input
                        v-model="value"
                        type="radio"
                        :value="i"
                        :class="$style.radio"
                    />
                </div>
                <div :class="$style.title">
                    <span @click="value = i">{{ variant }}</span>
                </div>
            </div>
        </div>
        <div :class="$style.controls">
            <FeatureTestingUiTechniqueControls :validate="validate" />
        </div>
    </div>
</template>

<style lang="less" module>
    @import '@styles/includes';

    .block_title {
        font-size: 18px;
        color: var(--stable-gray-1-color);
    }

    .question {
        font-size: 20px;
        margin-top: 5px;
    }

    .variants {
        margin-top: 20px;
        display: flex;
        flex-direction: column;
        gap: 10px;

        > div {
            display: flex;
            gap: 12px;

            > .radio {
                > input {
                    all: revert;
                    width: 20px;
                    height: 20px;
                    cursor: pointer;
                }
            }

            > .title {
                font-size: 18px;

                > span {
                    cursor: pointer;
                }
            }
        }
    }

    .controls {
        margin-top: 30px;
    }
</style>
