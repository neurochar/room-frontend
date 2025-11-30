import type { IRoom } from './room';

export interface IStateData {
    roomID: string;
    step: number;
    techniqueItemCurrent: number;
    answers: Map<number, any>;
}

export interface IState {
    room: IRoom | null;
    data: IStateData;
}
