import { useTestingStore } from '../store/store';
import type { IStateData } from '../types/store';

type IStateDataStored = Omit<IStateData, 'answers'> & {
    answers: [number, any][];
};

const STORAGE_INPUT = 'roomInput';
export const saveInputToStorage = (input: IStateData) => {
    const toStore: IStateDataStored = {
        ...input,
        answers: Array.from(input.answers.entries()),
    };

    localStorage.setItem(`${STORAGE_INPUT}-${input.roomID}`, JSON.stringify(toStore));
};

export const clearStorage = () => {
    const store = useTestingStore();

    localStorage.removeItem(`${STORAGE_INPUT}-${store.data.roomID}`);
};

export const putToInputFromStorage = () => {
    const store = useTestingStore();

    const inputStr = localStorage.getItem(`${STORAGE_INPUT}-${store.data.roomID}`);
    if (inputStr !== null) {
        try {
            const stored = JSON.parse(inputStr) as IStateDataStored;

            if (stored.step !== undefined && stored.step !== null) {
                store.setStep(stored.step);
            }

            if (stored.answers) {
                const answersMap = new Map<number, any>(stored.answers);
                store.data.answers = answersMap;
            }

            if (stored.techniqueItemCurrent) {
                store.setTechniqueItemCurrent(stored.techniqueItemCurrent);
            }
        } catch (e) {
            //
        }
    }
};
