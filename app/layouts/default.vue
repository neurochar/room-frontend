<script setup lang="ts">
    import '@/assets/styles/layouts/default.less';

    onMounted(() => {
        const appLayoutChangedTimes = useState<number>('appLayoutChangedTimes');
        appLayoutChangedTimes.value += 1;
        if (appLayoutChangedTimes.value > 1) {
            window.scrollTo({ top: -100 });
        }
    });
</script>

<template>
    <div id="all">
        <main class="default">
            <slot />
        </main>
    </div>
</template>

<style lang="less"></style>
