<script setup lang="ts">
    import { V1TechniqueItemType } from '~/api/generated/Api';
    import { useTestingStore } from '../model/store/store';

    const store = useTestingStore();
</script>

<template>
    <template v-if="store.nowTechniqueItem && store.nowTechniqueItem.type === V1TechniqueItemType.TECHNIQUE_ITEM_TYPE_QUESTION_WITH_VARIANTS_SINGLE_ANSWER">
        <FeatureTestingUiTechniqueItemQuestionWithVariants :technique-item="store.nowTechniqueItem" />
    </template>
</template>

<style lang="less" module>
    @import '@styles/includes';
</style>
