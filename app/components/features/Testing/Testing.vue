<script setup lang="ts">
    import { V1RoomStatus, type V1Room } from '~/api/generated/Api';
    import { ApiError } from '~/shared/errors/errors';
    import { declOfNum } from '~/shared/helpers/functions';
    import { putToInputFromStorage, saveInputToStorage } from './model/hooks/stateStorage';
    import { useTestingStore } from './model/store/store';

    const api = useApi();

    const props = defineProps<{
        id: string;
    }>();

    const store = useTestingStore();

    const isLoading = ref(true);

    const isLoadingAnything = computed(() => isLoading.value);

    const fetchItem = async (): Promise<V1Room | null> => {
        isLoading.value = true;
        try {
            const res = await api.v1.roomsPublicServiceGetRoom(props.id);

            if (res.error !== null) {
                throw res.error;
            }

            return res.data?.room || null;
        } catch (e) {
            if (e instanceof ApiError) {
                if (e.code === 400 || e.code === 404) {
                    showError({
                        statusCode: e.code,
                        statusMessage: 'Комната не найдена',
                    });
                }
            }
            console.error(e);
        } finally {
            isLoading.value = false;
        }

        return null;
    };

    watch(
        () => props.id,
        async () => {
            const room = await fetchItem();
            store.setRoomID(props.id);
            store.setRoom(room);

            putToInputFromStorage();
        },
        {
            immediate: true,
        },
    );

    const timing = computed(() => {
        if (!store.room) return 0;

        return Math.round(((store.room.techniqueData?.length || 0) * 10) / 60);
    });

    onMounted(async () => {
        watch(
            store.data,
            (data) => {
                saveInputToStorage(data);
            },
            { deep: true },
        );
    });
</script>

<template>
    <div>
        <template v-if="isLoadingAnything">
            <div :class="$style.loading">Загрузка...</div>
        </template>
        <template v-else-if="store.room">
            <template v-if="store.room.status === V1RoomStatus.ROOM_STATUS_FINISHED"> Работа с комнатой завершена </template>
            <template v-else>
                <div :class="$style.header">
                    <div :class="$style.greeting">
                        <b>{{ store.room.candidate?.candidateName }}</b
                        >, добро пожаловать в вашу персональную комнату!
                    </div>
                    <div
                        v-if="store.room.techniqueData"
                        :class="$style.about"
                    >
                        Пространство "{{ store.room.tenantName }}" приглашает вас пройти тест из {{ store.room.techniqueData.length }}
                        {{ declOfNum(store.room.techniqueData.length, ['вопроса', 'вопросов', 'вопросов']) }}. Потребуется примерно {{ timing }}
                        {{ declOfNum(timing, ['минута', 'минуты', 'минут']) }}.
                    </div>
                </div>
                <div :class="$style.techniques">
                    <template v-if="store.data.step === 1">
                        <button
                            type="button"
                            class="button_1"
                            @click="store.setStep(2)"
                        >
                            Начать
                        </button>
                    </template>
                    <template v-if="store.data.step === 2">
                        <FeatureTestingUiTechniqueItem />
                    </template>
                </div>
            </template>
        </template>
    </div>
</template>

<style lang="less" module>
    @import '@styles/includes';

    .loading {
        text-align: center;
        font-size: 24px;
        font-weight: 100;
    }

    .header {
        font-size: 20px;

        > .about {
            margin-top: 20px;
        }
    }

    .techniques {
        margin-top: 80px;
    }
</style>
