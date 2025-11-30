<script setup lang="ts">
    import { useTestingStore } from '../model/store/store';
    import { IRoomTechniqueDataType } from '../model/types/room';

    const store = useTestingStore();
</script>

<template>
    <template v-if="store.nowTechniqueItem && store.nowTechniqueItem.type === IRoomTechniqueDataType.question_with_variants">
        <FeatureTestingUiTechniqueItemQuestionWithVariants :technique-item="store.nowTechniqueItem" />
    </template>
</template>

<style lang="less" module>
    @import '@styles/includes';
</style>
