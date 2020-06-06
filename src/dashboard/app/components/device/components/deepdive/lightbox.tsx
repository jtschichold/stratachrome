import * as React from "react";
import { connect, MapDispatchToPropsFunction } from "react-redux";
import { toast } from "react-toastify";

import {
    DeepDiveTemplate,
    DeepDiveTemplateParameter,
    DeepDiveInstance,
    Device,
} from "../../../../../../common/models";
import { State as StoreState, store, actions } from "../../../../store";
import { DropdownSelect, DropdownSelectProps } from "../../../controls";
import { MetricListManager } from "../../../../lib/metrichandlers";

import { DeepDiveTemplateRenderer } from "./templaterenderer";
import {
    makeGetTypesForDevice,
    makeGetTemplatesForDevice,
    makeGetDeepDivesForDevice,
} from "./selectors";

export interface DeepDiveLightBoxSessionState {
    target: "overview" | "parameter" | "deepdivetpl" | null;
    templateId?: string;
    parameterValue?: {
        value: string;
        type: DeepDiveTemplateParameter["type"];
    };
}

interface DeepDiveLightboxOwnProps extends DeepDiveLightBoxSessionState {
    device: Device;
    metricListManager: MetricListManager;
    templates?: DeepDiveTemplate[];
    deepdives?: DeepDiveInstance[];
    types?: Map<
        DeepDiveTemplateParameter["type"],
        DropdownSelectProps["options"]
    >;
}

interface DeepDiveLightboxDispatchProps {
    deactivateDDLBox?: () => void;
}

// XXX from Docker - cite license
const adjectiveList: string[] = [
    "Admiring",
    "Adoring",
    "Affectionate",
    "Agitated",
    "Amazing",
    "Angry",
    "Awesome",
    "Beautiful",
    "Blissful",
    "Bold",
    "Boring",
    "Brave",
    "Busy",
    "Charming",
    "Clever",
    "Cool",
    "Compassionate",
    "Competent",
    "Condescending",
    "Confident",
    "Cranky",
    "Crazy",
    "Dazzling",
    "Determined",
    "Distracted",
    "Dreamy",
    "Eager",
    "Ecstatic",
    "Elastic",
    "Elated",
    "Elegant",
    "Eloquent",
    "Epic",
    "Exciting",
    "Fervent",
    "Festive",
    "Flamboyant",
    "Focused",
    "Friendly",
    "Frosty",
    "Funny",
    "Gallant",
    "Gifted",
    "Goofy",
    "Gracious",
    "Great",
    "Happy",
    "Hardcore",
    "Heuristic",
    "Hopeful",
    "Hungry",
    "Infallible",
    "Inspiring",
    "Interesting",
    "Intelligent",
    "Jolly",
    "Jovial",
    "Keen",
    "Kind",
    "Laughing",
    "Loving",
    "Lucid",
    "Magical",
    "Mystifying",
    "Modest",
    "Musing",
    "Naughty",
    "Nervous",
    "Nice",
    "Nifty",
    "Nostalgic",
    "Objective",
    "Optimistic",
    "Peaceful",
    "Pedantic",
    "Pensive",
    "Practical",
    "Priceless",
    "Quirky",
    "Quizzical",
    "Recursing",
    "Relaxed",
    "Reverent",
    "Romantic",
    "Sad",
    "Serene",
    "Sharp",
    "Silly",
    "Sleepy",
    "Stoic",
    "Strange",
    "Stupefied",
    "Sweet",
    "Tender",
    "Thirsty",
    "Trusting",
    "Unruffled",
    "Upbeat",
    "Vibrant",
    "Vigilant",
    "Vigorous",
    "Wizardly",
    "Wonderful",
    "Xenodochial",
    "Youthful",
    "Zealous",
    "Zen",
];

const InternalDeepDiveLightbox: React.FunctionComponent<
    DeepDiveLightboxOwnProps & DeepDiveLightboxDispatchProps
> = (props) => {
    let {
        target,
        parameterValue,
        templates,
        device,
        deepdives,
        metricListManager,
        deactivateDDLBox,
        types,
        templateId,
    } = props;

    const [currentTemplate, setCurrentTemplate] = React.useState(
        templateId ||
            (templates.length !== 0 &&
                (parameterValue?.type
                    ? templates.find(
                          (t) =>
                              t.parameters &&
                              t.parameters.length !== 0 &&
                              t.parameters[0].type === parameterValue.type
                      )?.id
                    : templates[0].id))
    );
    const [currentParameter, setCurrentParameter] = React.useState(
        parameterValue ? parameterValue.value : null
    );
    const [
        currentParameterOptions,
        setCurrentParameterOptions,
    ] = React.useState<DropdownSelectProps["options"]>([]);

    // transition
    const [display, setDisplay] = React.useState(false);

    let templateOptions: DropdownSelectProps["options"] = templates
        .map((t) => {
            return {
                name: t.name,
                value: t.id,
                group: t.category,
            };
        })
        .sort((a, b) => {
            if (a.group === "General") return -1;
            if (b.group === "General") return 1;

            return 0;
        });
    let templateDef = templates.find((t) => t.id === currentTemplate);

    // this is just for the transition
    React.useEffect(() => {
        if (!target && display) {
            setDisplay(false);
        }
        if (target && !display) {
            setTimeout(() => setDisplay(true), 0);
        }
    });

    // at the end of this effect currentTemplate and currentParameter
    // should be in sync
    React.useEffect(() => {
        if (!target) return;

        let localCurrentTemplate = currentTemplate;
        if (!localCurrentTemplate && templates.length !== 0) {
            localCurrentTemplate = templates[0].id;
            setCurrentTemplate(localCurrentTemplate);
        }

        let currentTemplateDef = templates.find(
            (t) => t.id === localCurrentTemplate
        );
        if (!currentTemplateDef) return;

        let currentParameterType = currentTemplateDef.parameters
            ? currentTemplateDef.parameters[0]?.type
            : null;
        if (!currentParameterType) {
            setCurrentParameter(null);
            setCurrentParameterOptions([]);
            return;
        }

        let currentTypes = types.get(currentParameterType);
        if (!currentTypes) {
            setCurrentParameter(null);
            setCurrentParameterOptions([]);
            return;
        } // XXX will display error;

        setCurrentParameterOptions(currentTypes);

        if (
            currentParameter &&
            currentTypes.findIndex((t) => t.value === currentParameter) !== -1
        )
            return;

        setCurrentParameter(currentTypes[0].value);
    }, [currentTemplate]);

    const onButtonCancel = () => {
        deactivateDDLBox();
    };

    const renderCurrentTemplate = () => {
        if (templateOptions.length === 0)
            return (
                <div className="notification is-danger grid-col-start-2 grid-col-end-4">
                    No templates available
                    {parameterValue && ` for ${parameterValue.type}`}
                </div>
            );

        if (!templateDef) return null;

        let localPV =
            templateDef.parameters?.map((tp) => ({
                name: tp.name,
                value: currentParameter,
            })) || [];

        return (
            <DeepDiveTemplateRenderer
                key={currentTemplate + (currentParameter || "")}
                templateId={currentTemplate}
                parameterValues={localPV}
                device={device}
                metricListManager={metricListManager}
            />
        );
    };

    let alreadyPinned = deepdives?.find(
        (ddi) =>
            ddi.templateId === currentTemplate &&
            (templateDef.parameters?.length > 0
                ? ddi.parameters[0].value === currentParameter
                : true)
    );

    const onPin = () => {
        if (!alreadyPinned) {
            let id = new Date().getTime(); // super sophisticated ID generator
            let name = currentParameter
                ? adjectiveList[id % adjectiveList.length] +
                  " " +
                  currentParameter
                : templateDef.name;
            let parameters =
                templateDef.parameters?.map((tp) => ({
                    name: tp.name,
                    value: currentParameter,
                })) || [];
            store.dispatch(
                actions.preferences.deepdiveInstanceUpsert(device.serial, {
                    name,
                    id: "" + id,
                    deviceSerial: device.serial,
                    templateId: currentTemplate,
                    parameters,
                })
            );
            toast(`Pinned as ${name}`);

            return;
        }

        store.dispatch(
            actions.preferences.deepdiveInstanceRemove(
                device.serial,
                alreadyPinned.id
            )
        );
        toast("Un-pinned");
    };

    const PinUnpinButton = () => {
        if (alreadyPinned) {
            return (
                <button
                    title="Un-pin"
                    className="button is-small is-link mr-3"
                    style={{
                        borderRadius: "1px 50% 50% 1px",
                        marginLeft: "-20px",
                    }}
                    onClick={onPin}
                >
                    <span className="icon" style={{ marginRight: "-5px" }}>
                        <span className="fa-stack fa-xs">
                            <i className="fas fa-thumbtack fa-stack-1x"></i>
                            <i className="fas fa-slash fa-stack-1x"></i>
                        </span>
                    </span>
                </button>
            );
        }

        return (
            <button
                title="Pin"
                className="button is-small is-link mr-3"
                style={{ borderRadius: "1px 50% 50% 1px", marginLeft: "-20px" }}
                onClick={onPin}
            >
                <span className="icon" style={{ marginRight: "-5px" }}>
                    <i className="fas fa-xs fa-thumbtack"></i>
                </span>
            </button>
        );
    };

    return (
        <div className={`modal ${display ? "is-active" : ""}`}>
            <div className="modal-background"></div>
            <div className="modal-card has-width-fit-content ddlbox">
                <header className="modal-card-head">
                    <div className="modal-card-title is-flex">
                        <div className="is-flex-center">
                            <PinUnpinButton />
                            <div>Deep Dive</div>
                        </div>
                        <div className="ml-6">
                            <DropdownSelect
                                options={templateOptions}
                                value={currentTemplate}
                                isRight={false}
                                onChange={setCurrentTemplate}
                                icon="alessia"
                            />
                        </div>
                        {currentParameterOptions.length !== 0 && (
                            <div className="ml-3">
                                <DropdownSelect
                                    options={currentParameterOptions}
                                    value={currentParameter}
                                    isRight={false}
                                    onChange={setCurrentParameter}
                                    filterEnabled
                                    mega={currentParameterOptions.length > 100}
                                />
                            </div>
                        )}
                    </div>
                    <button
                        className="delete is-medium"
                        style={{ alignSelf: "self-start" }}
                        aria-label="close"
                        onClick={onButtonCancel}
                    ></button>
                </header>
                <section className="modal-card-body">
                    <div className="is-grid is-grid-column-2">
                        {renderCurrentTemplate()}
                    </div>
                </section>
                <footer className="modal-card-foot">
                    <button className="button" onClick={onButtonCancel}>
                        Close
                    </button>
                </footer>
            </div>
        </div>
    );
};

const MemoizedDeepDiveLightbox = React.memo(
    InternalDeepDiveLightbox,
    (prevProps, nextProps) => {
        // Object.entries(nextProps).forEach(([k, v]) => {
        //     if (prevProps[k] !== v) {
        //         console.log(`changed: ${k}  ${prevProps[k]} => ${v}`);
        //     }
        // });

        if (!prevProps.target && !nextProps.target) return true;

        return false;
    }
);

const makeStateToProps = () => {
    const getTemplatesForDevice = makeGetTemplatesForDevice();
    const getTypesForDevice = makeGetTypesForDevice();
    const getDeepDivesForDevice = makeGetDeepDivesForDevice();

    return (state: StoreState, props: DeepDiveLightboxOwnProps) => {
        let ddlboxstate: DeepDiveLightBoxSessionState = state.session.find(
            (s) => s.key === "ddlboxState"
        )?.value;
        ddlboxstate = ddlboxstate || { target: null };

        let deepdives = getDeepDivesForDevice(state, props);
        let templates = getTemplatesForDevice(state, props);

        return {
            templates,
            deepdives,
            types: getTypesForDevice(state, props),
            ...ddlboxstate,
        };
    };
};

const mapDispatchToProps: MapDispatchToPropsFunction<
    DeepDiveLightboxDispatchProps,
    {}
> = (dispatch) => {
    return {
        deactivateDDLBox: () =>
            dispatch(actions.state.upsert("ddlboxState", null)),
    };
};

export const DeepDiveLightbox = connect(
    makeStateToProps,
    mapDispatchToProps
)(MemoizedDeepDiveLightbox);
