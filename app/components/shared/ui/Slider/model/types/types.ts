export interface ISliderItem {
    value: string | number;
    hasTip: boolean;
}

export interface IProps {
    items: ISliderItem[];
    initValue?: ISliderItem['value'];
}
