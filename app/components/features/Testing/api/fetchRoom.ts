import { tryToThrowApiErrors } from '~/shared/errors/errors';
import type { IRoom } from '../model/types/room';

export const fetchRoom = async (id: string) => {
    try {
        return await useNuxtApp().$apiFetch<IRoom>(`v1/rooms/${id}`);
    } catch (e: unknown) {
        throw tryToThrowApiErrors(e);
    }
};
