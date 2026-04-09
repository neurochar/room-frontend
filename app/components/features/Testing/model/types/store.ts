import type { V1AnswerValue, V1Room } from '~/api/generated/Api';

export interface IStateData {
    roomID: string;
    step: number;
    techniqueItemCurrent: number;
    answers: Map<number, V1AnswerValue>;
}

export interface IState {
    room: V1Room | null;
    data: IStateData;
}
