<script setup lang="ts">
    import IMask from 'imask';
    import { dateToString } from '~/shared/helpers/date';

    const vModel = defineModel<string>({ default: '' });
    const props = defineProps<{
        isError?: boolean;
    }>();

    const emit = defineEmits(['maskComplete', 'maskAccept']);

    const wrapperRef = useTemplateRef('wrapperRef');
    const calendarRef = useTemplateRef('calendarRef');
    const inputRef = useTemplateRef('inputRef');
    let maskObject: ReturnType<typeof IMask> | null = null;
    const inputValue = ref<string | number>(vModel.value);

    const maskIsComplete = ref(false);
    const maskRawInputValue = ref('');

    const isFocused = ref(false);

    watch(vModel, (newValue) => {
        if (skipVModelUpd) return;
        if (maskObject) {
            maskObject.value = newValue;
        }
    });

    let skipVModelUpd = false;

    watch(inputValue, (newValue) => {
        skipVModelUpd = true;
        vModel.value = newValue.toString();
        nextTick(() => {
            skipVModelUpd = false;
        });
    });

    const isCalendarOpened = ref(false);
    const isCalendarVisible = ref(false);
    const isCalendarToRight = ref(false);

    watch(isCalendarOpened, (value) => {
        if (value) {
            nextTick(() => {
                if (calendarRef.value) {
                    if (calendarRef.value.getBoundingClientRect().left < 0) {
                        isCalendarToRight.value = true;
                    }
                }
                isCalendarVisible.value = true;
            });
        } else {
            isCalendarVisible.value = false;
            isCalendarToRight.value = false;
        }
    });

    const onDatePicker = () => {
        isCalendarOpened.value = !isCalendarOpened.value;
    };

    const onDocClick = (e: MouseEvent) => {
        if (!wrapperRef.value || !e.target) return;
        const target = e.target as HTMLElement;
        if (isCalendarOpened.value && !wrapperRef.value.contains(target)) {
            isCalendarOpened.value = false;
        }
    };

    const parseDateString = (val: string): Date | null => {
        const valueSplited = val.split('.');

        let success = true;

        if (typeof valueSplited[0] == 'undefined' || isNaN(parseInt(valueSplited[0])) || parseInt(valueSplited[0]) < 1 || parseInt(valueSplited[0]) > 31) {
            success = false;
        }

        if (typeof valueSplited[1] == 'undefined' || isNaN(parseInt(valueSplited[1])) || parseInt(valueSplited[1]) < 1 || parseInt(valueSplited[1]) > 12) {
            success = false;
        }

        if (typeof valueSplited[2] == 'undefined' || isNaN(parseInt(valueSplited[2])) || parseInt(valueSplited[2]) < 1900 || parseInt(valueSplited[2]) > 2100) {
            success = false;
        }

        if (success == true) {
            return new Date(parseInt(valueSplited[2]!), parseInt(valueSplited[1]!) - 1, parseInt(valueSplited[0]!));
        }

        return null;
    };

    const calendarCurrentDayDate = computed(() => {
        const date = parseDateString(inputValue.value.toString());

        if (date === null) {
            const nowDate = new Date();
            return new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate());
        }

        return date;
    });

    const parseMonthDate = (date: Date): Date => {
        return new Date(date.getFullYear(), date.getMonth(), 1);
    };

    const calendarCurrentMonthDate = ref<Date>(parseMonthDate(calendarCurrentDayDate.value));

    const parsePrevMonthDate = (date: Date): Date => {
        let now_month = date.getMonth();
        let now_year = date.getFullYear();
        if (now_month == 0) {
            now_month = 11;
            now_year = now_year - 1;
        } else {
            now_month = now_month - 1;
        }

        return new Date(now_year, now_month, 1);
    };

    const parseNextMonthDate = (date: Date): Date => {
        let now_month = date.getMonth();
        let now_year = date.getFullYear();
        if (now_month == 11) {
            now_month = 0;
            now_year = now_year + 1;
        } else {
            now_month = now_month + 1;
        }

        return new Date(now_year, now_month, 1);
    };

    const calendarPrevMonthDate = computed(() => parsePrevMonthDate(calendarCurrentMonthDate.value));
    const calendarNextMonthDate = computed(() => parseNextMonthDate(calendarCurrentMonthDate.value));

    const getDaysCount = (year: number, month: number) => {
        if (month == 4 || month == 6 || month == 9 || month == 11) {
            return 30;
        }
        if (month == 2) {
            const leap = year % 4 == 0 && (year % 100 != 0 || year % 400 == 0);
            if (!leap) {
                return 28;
            } else {
                return 29;
            }
        }
        return 31;
    };

    const calendarDaysMap = computed(() => {
        const result: { date: Date; type: 'this' | 'prev' | 'next' }[] = [];

        //Предыдущие дни
        let day = calendarCurrentMonthDate.value.getDay();
        if (day == 0) {
            day = 7;
        }
        const before_days = day - 1;
        if (before_days > 0) {
            const last_month_days_count = getDaysCount(calendarPrevMonthDate.value.getFullYear(), calendarPrevMonthDate.value.getMonth() + 1);
            for (let i = before_days; i > 0; i--) {
                result.push({
                    date: new Date(calendarPrevMonthDate.value.getFullYear(), calendarPrevMonthDate.value.getMonth(), last_month_days_count - i + 1),
                    type: 'prev',
                });
            }
        }

        //Текущие дни
        const days_count = getDaysCount(calendarCurrentMonthDate.value.getFullYear(), calendarCurrentMonthDate.value.getMonth() + 1);
        for (let i = 1; i <= days_count; i++) {
            result.push({
                date: new Date(calendarCurrentMonthDate.value.getFullYear(), calendarCurrentMonthDate.value.getMonth(), i),
                type: 'this',
            });
        }

        //Дни следующего месяца
        const next_date = new Date(calendarCurrentMonthDate.value.getFullYear(), calendarCurrentMonthDate.value.getMonth(), days_count);
        day = next_date.getDay();
        if (day == 0) {
            day = 7;
        }
        const after_days = 7 - day;
        if (after_days > 0) {
            for (let i = 1; i <= after_days; i++) {
                result.push({
                    date: new Date(calendarNextMonthDate.value.getFullYear(), calendarNextMonthDate.value.getMonth(), i),
                    type: 'next',
                });
            }
        }

        return result;
    });

    const getDateMonthTitle = (monthIndex: number) => {
        const values = {
            0: 'Январь',
            1: 'Февраль',
            2: 'Март',
            3: 'Апрель',
            4: 'Май',
            5: 'Июнь',
            6: 'Июль',
            7: 'Август',
            8: 'Сентябрь',
            9: 'Октябрь',
            10: 'Ноябрь',
            11: 'Декабрь',
        };

        return values[monthIndex as keyof typeof values] || '';
    };

    const calMonthPrev = () => {
        calendarCurrentMonthDate.value = parsePrevMonthDate(calendarCurrentMonthDate.value);
    };

    const calMonthNext = () => {
        calendarCurrentMonthDate.value = parseNextMonthDate(calendarCurrentMonthDate.value);
    };

    const setDate = (date: Date) => {
        if (maskObject) {
            maskObject.value = dateToString(date);
        }
        isCalendarOpened.value = false;
    };

    onMounted(() => {
        if (inputRef.value) {
            maskObject = IMask(inputRef.value, { mask: Date });
            maskObject.on('accept', () => {
                if (!maskObject) return;
                maskIsComplete.value = false;
                maskRawInputValue.value = maskObject.rawInputValue;
                inputValue.value = maskObject.value;
                emit('maskAccept');
            });
            maskObject.on('complete', () => {
                if (!maskObject) return;
                maskIsComplete.value = true;
                maskRawInputValue.value = maskObject.rawInputValue;
                inputValue.value = maskObject.value;
                emit('maskComplete');
            });
            maskIsComplete.value = maskObject.masked.isComplete;
            maskRawInputValue.value = maskObject.rawInputValue;

            inputRef.value.addEventListener(
                'focus',
                function () {
                    if (!maskObject) return;
                    maskObject.updateOptions({ lazy: false });
                },
                true,
            );
            inputRef.value.addEventListener(
                'blur',
                function () {
                    if (!maskObject) return;
                    maskObject.updateOptions({ lazy: true });
                },
                true,
            );
        }

        document.addEventListener('mousedown', onDocClick);
    });

    onUnmounted(() => {
        document.removeEventListener('mousedown', onDocClick);

        if (maskObject) {
            maskObject.destroy();
        }
    });
</script>

<template>
    <div
        ref="wrapperRef"
        :class="[$style.wrapper]"
    >
        <div :class="$style.picker">
            <input
                ref="inputRef"
                :value="inputValue.toString()"
                type="text"
                placeholder="dd.mm.yyy"
                :class="[isError || (!isFocused && maskRawInputValue.length > 0 && maskIsComplete === false) ? 'ui_red_border' : false]"
                @focus="isFocused = true"
                @blur="isFocused = false"
            />
            <button
                :class="$style.date_picker"
                type="button"
                @click="onDatePicker"
            ></button>
        </div>
        <div
            v-if="isCalendarOpened"
            ref="calendarRef"
            :class="[$style.calendar, !isCalendarVisible ? $style.hidden : false, isCalendarToRight ? $style.to_right : false]"
        >
            <div :class="$style.nav">
                <button
                    type="button"
                    :class="$style.left"
                    @click="calMonthPrev"
                >
                    &laquo;
                </button>
                <div>{{ getDateMonthTitle(calendarCurrentMonthDate.getMonth()) }} {{ calendarCurrentMonthDate.getFullYear() }}</div>
                <button
                    ttpe="button"
                    class="right"
                    @click="calMonthNext"
                >
                    &raquo;
                </button>
            </div>
            <div :class="$style.days_week">
                <div><span title="Понедельник">пн</span></div>
                <div><span title="Вторник">вт</span></div>
                <div><span title="Среда">ср</span></div>
                <div><span title="Четверг">чт</span></div>
                <div><span title="Пятница">пт</span></div>
                <div><span title="Суббота">сб</span></div>
                <div><span title="Воскресенье">вс</span></div>
            </div>
            <div :class="$style.days">
                <template
                    v-for="(day, day_index) in calendarDaysMap"
                    :key="day_index"
                >
                    <div :class="[day.type !== 'this' ? $style.no : false]">
                        <button
                            type="button"
                            :class="{
                                [$style.weekend]: day_index % 7 == 5 || day_index % 7 == 6,
                                [$style.sel]:
                                    day.date.getFullYear() == calendarCurrentDayDate.getFullYear() &&
                                    day.date.getMonth() == calendarCurrentDayDate.getMonth() &&
                                    day.date.getDate() == calendarCurrentDayDate.getDate(),
                            }"
                            @click="setDate(day.date)"
                        >
                            {{ day.date.getDate() }}
                        </button>
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>

<style lang="less" module>
    @import '@styles/includes';

    .wrapper {
        position: relative;
        //z-index: 10;

        > .picker {
            position: relative;
            font-size: 0;

            > input {
                background: var(--ui-bg-color);
                height: 60px;
                width: 100%;
                border: 1px solid var(--ui-border-color);
                border-radius: 30px;
                padding: 0 50px 0 20px;

                box-sizing: border-box;
                font-size: 19px;
                color: var(--ui-text-color);
                box-shadow: inset 0px 0px 5px rgba(0, 0, 0, 0.2);

                &::placeholder {
                    color: var(--ui-placeholder-color);
                    opacity: 1;
                }

                &:focus-visible {
                    box-shadow: 0px 0px 3px 2px var(--ui-focus-shadow);
                }
            }

            > .date_picker {
                display: block;
                position: absolute;
                right: 20px;
                top: calc(50% - 12px);
                width: 24px;
                height: 24px;
                mask: url('@/assets/icons/ui/date_picker.svg') no-repeat center center;
                mask-size: contain;
                background-color: var(--color-2);
                transition: background-color 0.25s ease;
                -webkit-tap-highlight-color: transparent;

                .hover({
                    background-color: var(--color-2-hover);
                });
            }
        }

        > .calendar {
            position: absolute;
            z-index: 10;
            top: 100%;
            right: 0;
            background: #fff;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
            border-radius: 10px;
            width: 290px;
            padding: 15px 0;
            color: #1f222a;

            &.to_right {
                right: auto;
                left: 0;
            }

            &.hidden {
                opacity: 0;
            }

            > .nav {
                display: flex;
                align-items: center;
                padding: 0 18px 15px 18px;

                > button {
                    flex-shrink: 0;
                    display: block;
                    text-decoration: none;
                    font-size: 24px;
                    text-align: center;
                    background-color: var(--color-1);
                    color: #fff;
                    width: 30px;
                    height: 30px;
                    line-height: 28px;
                    border-radius: 30px;
                    transition: background-color 0.25s ease;

                    .hover({
                        background-color: var(--color-1-hover);
                    });
                }

                > div {
                    text-align: center;
                    width: 100%;
                    font-weight: 600;
                    font-size: 18px;
                }
            }

            > .days_week {
                display: flex;
                flex-wrap: wrap;
                padding: 10px 15px;
                background: #fff;

                > div {
                    flex-basis: calc(100% / 7);
                    box-sizing: border-box;
                    text-align: center;
                    color: #000;
                    font-size: 14px;
                    font-weight: 500;

                    &:nth-child(6),
                    &:nth-child(7) {
                        color: var(--color-1);
                    }
                }
            }

            > .days {
                display: flex;
                flex-wrap: wrap;
                padding: 10px 15px 0 15px;

                > div {
                    flex-basis: calc(100% / 7);
                    box-sizing: border-box;
                    font-size: 16px;

                    > button {
                        display: block;
                        width: 100%;
                        padding: 7px 0;
                        text-decoration: none;
                        text-align: center;

                        &.weekend {
                            color: var(--color-1);
                        }

                        .hover({
                            color: #636b83;

                            &.weekend {
                                color: var(--color-1-hover);
                            }
                        });

                        &.sel {
                            background-color: var(--color-1);
                            color: #fff !important;
                        }
                    }

                    &.no {
                        > a {
                            color: #8e8e8e;
                        }
                    }
                }
            }
        }

        .width-size-sm-less({
            > .picker {
                > input {
                    height:40px;
                    border-radius: 20px;
                    padding:0 40px 0 15px;
                    font-size:16px;
                }

                > .date_picker {
                    right: 15px;
                    width: 18px;
                    height: 18px;
                    top: calc(50% - 9px);
                }
            }
        });
    }
</style>
