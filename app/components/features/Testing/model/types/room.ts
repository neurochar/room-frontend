export enum IRoomStatus {
    'not_started' = 0,
    'finished' = 10,
}

export enum IRoomTechniqueDataType {
    'question_with_variants' = 1,
}

export interface IRoomTechniqueDataQuestionWithVariants {
    type: IRoomTechniqueDataType.question_with_variants;
    question: string;
    variants: string[];
}

export type IRoomTechniqueData = IRoomTechniqueDataQuestionWithVariants;

export interface IRoom {
    id: string;
    status: IRoomStatus;
    tenantName: string;
    candidate: {
        candidateName: string;
    };
    techniqueData: IRoomTechniqueData[] | null;
}
