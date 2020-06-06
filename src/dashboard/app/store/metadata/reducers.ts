import { DeepDiveTemplate, OptionalPoller } from "../../../../common/models";

import { DEEPDIVETPL_SET, OPTIONALPOLLER_SET } from "./actions";

export interface State {
    templateList: DeepDiveTemplate[];
    optionalPollers: OptionalPoller[];
}

const initialState: State = {
    templateList: [],
    optionalPollers: [],
};

export function metadata(state = initialState, action: any): State {
    switch (action.type) {
        case DEEPDIVETPL_SET:
            return {
                ...state,
                templateList: action.payload.templates,
            };

        case OPTIONALPOLLER_SET:
            return {
                ...state,
                optionalPollers: action.payload.optionalPollers,
            };

        default:
            return state;
    }
}
