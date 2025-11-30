import { openModalAlert } from '~/components/shared/modals/Alert/useModalAlert';
import { StandartErrorList } from '~/shared/errors/errors';
import { finishRoom as apiFinishRoom } from '../../api/finishRoom';
import { useTestingStore } from '../store/store';
import { IRoomStatus } from '../types/room';
import { clearStorage } from './stateStorage';

function mapToRecord<T = any>(map: Map<number, T>): Record<string, T> {
    return Object.fromEntries(Array.from(map.entries()).map(([key, value]) => [String(key), value]));
}

export const finishRoom = async () => {
    const store = useTestingStore();

    try {
        await apiFinishRoom(store.data.roomID, {
            dataAnswers: mapToRecord(store.data.answers),
        });

        openModalAlert('Тестирование завершено!');

        const room = { ...store.room!, status: IRoomStatus.finished };

        store.setRoom(room);

        clearStorage();
    } catch (e: unknown) {
        if (e instanceof StandartErrorList) {
            openModalAlert('Возникли ошибки:<br /> ' + e.formHints().join('<br /> '));
        }
    }
};
