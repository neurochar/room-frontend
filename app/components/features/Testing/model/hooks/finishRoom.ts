import { V1RoomStatus, type V1AnswerValue } from '~/api/generated/Api';
import { openModalAlert } from '~/components/shared/modals/Alert/useModalAlert';
import { ApiError } from '~/shared/errors/errors';
import { useTestingStore } from '../store/store';
import { clearStorage } from './stateStorage';

function mapToRecord<T = V1AnswerValue>(map: Map<number, T>): Record<string, T> {
    return Object.fromEntries(Array.from(map.entries()).map(([key, value]) => [String(key), value]));
}

export const finishRoom = async () => {
    const store = useTestingStore();
    const api = useApi();

    try {
        const res = await api.v1.roomsPublicServiceFinishRoom(store.data.roomID, {
            payload: {
                answers: {
                    data: mapToRecord(store.data.answers),
                },
            },
        });

        if (res.error !== null) {
            throw res.error;
        }

        openModalAlert('Тестирование завершено!');

        const room = { ...store.room!, status: V1RoomStatus.ROOM_STATUS_FINISHED };

        store.setRoom(room);

        clearStorage();
    } catch (e: unknown) {
        if (e instanceof ApiError) {
            openModalAlert('Возникли ошибки:<br /> ' + e.formHints().join('<br /> '));
        }
    }
};
