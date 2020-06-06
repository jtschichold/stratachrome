import jmespath from "./jmespath";

import { DeepDiveTemplate, Device } from "../../../../../../common/models";
import { MetricListManager } from "../../../../lib/metrichandlers";

export const buildContext = (
    device: Device,
    metricListManager: MetricListManager,
    template: DeepDiveTemplate,
    parameters: { name: string; value: string }[]
) => {
    let {
        deviceName,
        serial,
        model,
        swVersion,
        hwInterfaces,
        logicalInterfaces,
        vsysList,
    } = device;

    let ctx = {
        device: {
            deviceName,
            serial,
            model,
            swVersion,
            hwInterfaces,
            logicalInterfaces,
            vsysList,
        },
    };

    ctx["metrics"] = metricListManager.metrics.map((m) => m.name);

    parameters.forEach(({ name, value }) => {
        if (template.parameters?.find((tp) => tp.name === name)) {
            ctx[name] = value;
        }
    });

    return ctx;
};

export const interpolateString = (s: string, ctx: any): string => {
    let result = s.replace(/{{([^{}]*)}}/g, (match, pattern) => {
        let r = jmespath.search(ctx, pattern);
        return r instanceof String ||
            r instanceof Number ||
            typeof r === "string" ||
            typeof r === "number"
            ? r.toString()
            : match;
    });

    return result;
};

export const applyForEach = (forEach: string, ctx: any): any[] => {
    let result = jmespath.search(ctx, forEach);

    if (result === null || typeof result === "undefined") {
        return [];
    }

    if (!Array.isArray(result)) {
        return [result];
    }

    return result;
};
