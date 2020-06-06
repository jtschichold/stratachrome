import { DeepDiveTemplate, OptionalPoller } from "../../../../common/models";

export const DEEPDIVETPL_SET: string = "DEEPDIVETPL_SET";
export const OPTIONALPOLLER_SET: string = "OPTIONALPOLLER_SET";

export function setTemplates(templates: DeepDiveTemplate[]) {
    return {
        type: DEEPDIVETPL_SET,
        payload: {
            templates,
        },
    };
}

export function setOptionalPollers(optionalPollers: OptionalPoller[]) {
    return {
        type: OPTIONALPOLLER_SET,
        payload: {
            optionalPollers,
        },
    };
}
