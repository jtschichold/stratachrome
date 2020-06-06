import {
    Device,
    DeepDiveTemplateParameter,
} from "../../../../../../common/models";
import { State as StoreState } from "../../../../store";
import { CounterGlobalList } from "../../../../lib/counters";
import { createAlmostShallowSelector } from "../../../../../../common/lib/storeutils";
import { DropdownSelectProps } from "../../../controls";

// XXX
const counters = CounterGlobalList.map<DropdownSelectProps["options"][0]>(
    (cm) => ({
        name: cm.name,
        value: cm.name,
        group: cm.severity,
    })
);

const typesForDevice = (
    device: Device
): Map<DeepDiveTemplateParameter["type"], DropdownSelectProps["options"]> => {
    let result = new Map<
        DeepDiveTemplateParameter["type"],
        DropdownSelectProps["options"]
    >();

    result.set(
        "HardwareInterface",
        device.hwInterfaces.map((hi) => ({
            name: hi.name,
            value: hi.name,
        }))
    );
    result.set(
        "LogicalInterface",
        device.logicalInterfaces.map((li) => ({
            name: li.name,
            value: li.name,
        }))
    );
    result.set("Counter", counters);

    let vsyses: DropdownSelectProps["options"] = [];
    let zones: DropdownSelectProps["options"] = [];
    device.logicalInterfaces.forEach((logicalIf) => {
        let { zone, vsys } = logicalIf;

        if (zone && zones.findIndex((z) => z.value === zone) === -1) {
            zones.push({
                name: zone,
                value: zone,
            });
        }

        if (vsys) {
            let vsysName = `vsys${vsys}`;
            if (vsyses.findIndex((v) => v.value === vsysName) === -1) {
                vsyses.push({
                    name: vsysName,
                    value: vsysName,
                });
            }
        }
    });
    result.set("Vsys", vsyses);
    result.set("Zone", zones);

    return result;
};

const getTemplatesWithSingleParameter = (state: StoreState) =>
    state.metadata.templateList.filter((t) => t.parameters.length === 1);
const getTemplatesWithNoParameter = (state: StoreState) =>
    state.metadata.templateList.filter(
        (t) => !t.parameters || t.parameters.length === 0
    );
const getParameterType = <
    T extends { parameterType: DeepDiveTemplateParameter["type"] }
>(
    state: StoreState,
    props: T
) => props.parameterType;
const getDevice = <T extends { device: Device }>(state: StoreState, props: T) =>
    props.device;
const getPreferencesForDevice = <T extends { device: Device }>(
    state: StoreState,
    props: T
) =>
    props.device.serial &&
    state.preferences.preferences?.find(
        (p) => p.serial === props.device.serial
    );

export const makeGetTemplatesByParameterType = () => {
    return createAlmostShallowSelector(
        [getTemplatesWithSingleParameter, getParameterType],
        (templates, ptype) => {
            return templates.filter((t) => t.parameters[0].type === ptype);
        }
    );
};

export const makeGetTypesForDevice = () => {
    return createAlmostShallowSelector([getDevice], (device) => {
        return typesForDevice(device);
    });
};

export const makeGetTemplatesForDevice = () => {
    return createAlmostShallowSelector(
        [
            getDevice,
            getTemplatesWithSingleParameter,
            getTemplatesWithNoParameter,
        ],
        (device, templatesWithSingleParameter, templatesWithNoParameter) => {
            let types = typesForDevice(device);

            return [
                ...templatesWithNoParameter,
                ...templatesWithSingleParameter.filter((t) => {
                    let ptype = types.get(t.parameters[0].type);

                    return ptype && ptype.length !== 0;
                }),
            ];
        }
    );
};

export const makeGetDeepDivesForDevice = () => {
    return createAlmostShallowSelector(
        [getPreferencesForDevice],
        (preferences) => {
            return preferences?.deepdives || [];
        }
    );
};
