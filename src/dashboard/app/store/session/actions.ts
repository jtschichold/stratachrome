export const SESSION_UPSERT: string = "SESSION_UPSERT";
export const SESSION_REMOVE: string = "SESSION_REMOVE";

export function upsert(key: string, value: any) {
    return {
        type: SESSION_UPSERT,
        payload: {
            key,
            value,
        },
    };
}

export function remove(key: string) {
    return {
        type: SESSION_REMOVE,
        payload: {
            key,
        },
    };
}
