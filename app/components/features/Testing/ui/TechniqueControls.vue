<script setup lang="ts">
    import { finishRoom } from '../model/hooks/finishRoom';
    import { useTestingStore } from '../model/store/store';

    const props = defineProps<{
        validate: () => Promise<boolean>;
    }>();

    const store = useTestingStore();

    const next = async () => {
        if (await props.validate()) {
            if (store.data.techniqueItemCurrent === store.nowTechniqueData.length - 1) {
                finishRoom();
            } else {
                store.setNextTechniqueItemCurrent();
            }
        }
    };
</script>

<template>
    <template v-if="store.data.techniqueItemCurrent === store.nowTechniqueData.length - 1">
        <button
            type="button"
            class="button_1"
            @click="next"
        >
            Завершить
        </button>
    </template>
    <template v-else>
        <button
            type="button"
            class="button_1"
            @click="next"
        >
            Далее
        </button>
    </template>
</template>

<style lang="less" module>
    @import '@styles/includes';
</style>
