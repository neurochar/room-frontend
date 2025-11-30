import type { ISlotsSwiperPropsSize } from '~/components/shared/ScrollerSwiper/model/types/types';

export const SIZES_3_IN_ROW_W360_G40: ISlotsSwiperPropsSize[] = [
    {
        to: 575,
        mode: 'scroller',
        slotWidth: 220,
        offsetWidth: 20,
        marginX: 15,
    },
    {
        to: 640,
        mode: 'scroller',
        slotWidth: 290,
        offsetWidth: 20,
        marginX: 30,
    },
    {
        to: Infinity,
        mode: 'plain',
        slotWidth: 360,
        offsetWidth: 40,
    },
];

export const SIZES_3_IN_ROW_W260_G40: ISlotsSwiperPropsSize[] = [
    {
        to: 575,
        mode: 'scroller',
        slotWidth: 220,
        offsetWidth: 20,
        marginX: 15,
    },
    {
        to: Infinity,
        mode: 'plain',
        slotWidth: 260,
        offsetWidth: 40,
    },
];

export const SIZES_SWIPER_W260_G40: ISlotsSwiperPropsSize[] = [
    {
        to: 575,
        mode: 'scroller',
        slotWidth: 220,
        offsetWidth: 20,
        marginX: 15,
    },
    {
        to: Infinity,
        marginLeft: (w: number) => {
            let result = Math.round((w - 1160) / 2);
            if (result < 30) {
                result = 30;
            }
            return result;
        },
        mode: 'swiper',
        slotWidth: 260,
        offsetWidth: 40,
        marginX: 30,
        onlyFullSlots: false,
        showArrows: true,
        showPoints: false,
    },
];

export const SIZES_3_IN_ROW_W236_G40: ISlotsSwiperPropsSize[] = [
    {
        to: 575,
        mode: 'scroller',
        slotWidth: 220,
        offsetWidth: 30,
        marginX: 15,
    },
    {
        to: Infinity,
        mode: 'plain',
        slotWidth: 250,
        offsetWidth: 40,
    },
];
