import type { V1AnswerValue, V1Room, V1RoomTechniqueItem } from '~/api/generated/Api';
import type { IState, IStateData } from '../types/store';

const getDefaultStore = (): IState => {
    return {
        data: {
            roomID: '',
            step: 1,
            techniqueItemCurrent: 0,
            answers: new Map(),
        },
        room: null,
    };
};

export const useTestingStore = defineStore('testingStore', {
    state: getDefaultStore,
    actions: {
        setData(data: IStateData) {
            this.data = data;
        },

        setRoomID(roomID: string) {
            this.data.roomID = roomID;
        },

        setRoom(room: V1Room | null) {
            this.room = room;
        },

        setStep(id: number) {
            const step = this.nowSteps.find((step) => step === id);
            if (step !== undefined) {
                this.data.step = id;
            }
        },

        setTechniqueItemCurrent(value: number) {
            if (value >= 0 && value < this.nowTechniqueData.length) {
                this.data.techniqueItemCurrent = value;
            }
        },

        setPrevTechniqueItemCurrent() {
            if (this.data.techniqueItemCurrent > 0) {
                this.data.techniqueItemCurrent -= 1;
            }
        },

        setNextTechniqueItemCurrent() {
            if (this.data.techniqueItemCurrent < this.nowTechniqueData.length - 1) {
                this.data.techniqueItemCurrent += 1;
            }
        },

        setAnswer(index: number, value: V1AnswerValue) {
            this.data.answers.set(index, value);
        },

        clearAnswer(index: number) {
            this.data.answers.delete(index);
        },
    },
    getters: {
        nowSteps(): number[] {
            return [1, 2];
        },

        nowTechniqueData(): V1RoomTechniqueItem[] {
            if (this.room === null) {
                return [];
            }
            return this.room.techniqueData || [];
        },

        nowTechniqueItem(): V1RoomTechniqueItem | null {
            const item = this.nowTechniqueData[this.data.techniqueItemCurrent];
            if (!item) {
                return null;
            }

            return item;
        },
    },
});
