import { tryToThrowApiErrors } from '~/shared/errors/errors';

interface Input {
    dataAnswers: Record<string, any>;
}

export async function finishRoom(id: string, input: Input) {
    try {
        return await useNuxtApp().$apiFetch(`v1/rooms/${id}`, {
            method: 'POST',
            body: input,
        });
    } catch (e: unknown) {
        throw tryToThrowApiErrors(e);
    }
}
