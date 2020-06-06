export const CONFIG_SET: string = "CONFIG_SET";
export const CONFIG_UNSET: string = "CONFIG_UNSET";

export function set(key: string, value: any) {
    return {
        type: CONFIG_SET,
        payload: {
            key: key,
            value: value,
        },
    };
}

export function unset(key: string) {
    return {
        type: CONFIG_UNSET,
        payload: {
            key: key,
        },
    };
}
