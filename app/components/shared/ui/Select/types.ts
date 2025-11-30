export interface ISelectOption<T = any> {
    value: string | number;
    data: T;
}

export interface ISelectPrepOption<T = any> extends ISelectOption<T> {
    id: number;
}

export interface ISelectProps<T> {
    initValue?: string | number;
    options: ISelectOption<T>[];
    maxOptionsWidth?: number;
    maxHeight?: number;
    nullable?: boolean;
    searchable?: boolean;
    searchablePlaceholder?: string;
    filterFunc?: (filter: string, options: ISelectPrepOption<T>[]) => ISelectPrepOption<T>[];
}
