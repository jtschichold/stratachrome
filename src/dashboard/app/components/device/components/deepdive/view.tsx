import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import { connect } from "react-redux";

import {
    Device,
    DeepDiveTemplate,
    DeepDiveInstance,
} from "../../../../../../common/models";
import { MetricListManager } from "../../../../lib/metrichandlers";
import { State as StoreState, store, actions } from "../../../../store";
import { DeepDiveTemplateRenderer } from "./templaterenderer";
import { buildContext, interpolateString } from "./templateutils";
import { MainGrid } from "../../../../components/maingrid";

export interface DeepDiveViewRouteProps {
    id?: string;
}

interface DeepDiveViewProps {
    device: Device;
    metricListManager: MetricListManager;
    deepdive?: DeepDiveInstance; // added by MapStateToProps
    template?: DeepDiveTemplate;
}

const InternalDeepDiveView: React.FunctionComponent<
    DeepDiveViewProps & RouteComponentProps<DeepDiveViewRouteProps>
> = (props) => {
    const [memoizedDeepDive, setMemoizedDeepDive] = React.useState<
        DeepDiveInstance
    >(null);
    const [memoizedTemplate, setMemoizedTemplate] = React.useState<
        DeepDiveTemplate
    >(null);
    let { deepdive, template, device, metricListManager } = props;

    const updateChord = () => {
        let pinButton = document.querySelector<HTMLButtonElement>(
            ".pin-button"
        );
        if (!pinButton) return;

        let pinRect = pinButton.getBoundingClientRect();
        let liActiveRect = document
            .querySelector("li .is-active")
            ?.getBoundingClientRect();
        let chord = document.querySelector<HTMLDivElement>(".pin-button-chord");
        if (!liActiveRect) {
            chord.style.visibility = "hidden";
            return;
        }

        chord.style.visibility = "visible";
        chord.style.width = "" + (pinRect.left - liActiveRect.right) + "px";
        chord.style.height =
            "" +
            (liActiveRect.bottom -
                pinRect.top -
                pinRect.height / 2 -
                liActiveRect.height / 2) +
            "px";
        chord.style.top = "" + (pinRect.top + pinRect.height / 2) + "px";
        chord.style.left = "" + liActiveRect.right + "px";
    };

    React.useEffect(() => {
        updateChord();
    });

    React.useEffect(() => {
        updateChord();
        // let throttled = debounce(updateChord, 25);
        let mainContent = document.querySelector<HTMLButtonElement>(
            ".is-main-content"
        );
        let sideBar = document.querySelector<HTMLDivElement>(
            "section > aside.is-sidebar-menu"
        );
        mainContent.addEventListener("scroll", updateChord);
        sideBar.addEventListener("scroll", updateChord);
        window.addEventListener("resize", updateChord);
        return () => {
            mainContent.removeEventListener("scroll", updateChord);
            sideBar.removeEventListener("scroll", updateChord);
            window.removeEventListener("resize", updateChord);
        };
    }, []);

    if (!memoizedDeepDive && deepdive) {
        setMemoizedDeepDive(deepdive);
    }
    if (!memoizedTemplate && template) {
        setMemoizedTemplate(template);
    }

    // XXX bettter errors
    if (!memoizedDeepDive) return <div>Deep Dive Not Found...</div>;
    if (!memoizedTemplate) return <div>Deep Dive Template Not Found...</div>;

    const ctx = buildContext(
        device,
        metricListManager,
        memoizedTemplate,
        memoizedDeepDive.parameters
    );
    let subtitle = `${
        memoizedTemplate.name
    } on ${memoizedDeepDive.parameters.map((p) => p.value).join(" & ")}`;
    if (memoizedTemplate.subtitle) {
        subtitle = interpolateString(memoizedTemplate.subtitle, ctx);
    }

    const onTogglePin = () => {
        if (!deepdive) {
            store.dispatch(
                actions.preferences.deepdiveInstanceUpsert(device.serial, {
                    ...memoizedDeepDive,
                })
            );
        } else {
            store.dispatch(
                actions.preferences.deepdiveInstanceRemove(
                    device.serial,
                    memoizedDeepDive.id
                )
            );
        }
    };

    const PinUnpinButton = () => {
        return (
            <button
                title="Un-pin"
                className="button pin-button is-small is-link"
                style={{ borderRadius: "1px 50% 50% 1px" }}
                onClick={onTogglePin}
            >
                {deepdive && (
                    <span className="icon" style={{ marginRight: "-5px" }}>
                        <span className="fa-stack fa-xs">
                            <i className="fas fa-thumbtack fa-stack-1x"></i>
                            <i className="fas fa-slash fa-stack-1x"></i>
                        </span>
                    </span>
                )}
                {!deepdive && (
                    <span className="icon" style={{ marginRight: "-5px" }}>
                        <i className="fas fa-xs fa-thumbtack"></i>
                    </span>
                )}
            </button>
        );
    };

    return (
        <>
            <MainGrid.Header>
                <div className="level-left">
                    <div className="level-item">
                        <div style={{ fontSize: "15px" }}>
                            <div className="title is-5 is-spaced is-flex-center">
                                <div
                                    className="mr-2"
                                    style={{ fontSize: "15px" }}
                                >
                                    <PinUnpinButton />
                                </div>
                                <div>{memoizedDeepDive.name}</div>
                            </div>
                            <div className="subtitle is-6 mb-0 mt-2">
                                {subtitle}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="level-right"></div>
            </MainGrid.Header>
            <div className="pin-button-chord">
                <div className="pin-button-chord-left" />
                <div className="pin-button-chord-right" />
            </div>
            <DeepDiveTemplateRenderer
                templateId={memoizedDeepDive.templateId}
                parameterValues={memoizedDeepDive.parameters}
                device={device}
                metricListManager={metricListManager}
            />
        </>
    );
};

const MemoizedInternalDeepDiveView = React.memo<DeepDiveViewProps>(
    InternalDeepDiveView,
    (prevProps: DeepDiveViewProps, nextProps: DeepDiveViewProps) => {
        if (prevProps.deepdive !== nextProps.deepdive) return false;
        if (prevProps.metricListManager !== nextProps.metricListManager)
            return false;
        if (prevProps.template !== nextProps.template) return false;
        if (prevProps.device.serial !== nextProps.device.serial) return false;

        return true;
    }
);

const mapStateToProps = (
    state: StoreState,
    props: RouteComponentProps<DeepDiveViewRouteProps> & DeepDiveViewProps
) => {
    let deepdive = state.preferences.preferences
        .find((p) => p.serial === props.device.serial)
        ?.deepdives.find((ddi) => ddi.id === props.match.params.id);
    if (!deepdive) return {};

    return {
        deepdive,
        template: state.metadata.templateList.find(
            (ddt) => ddt.id === deepdive.templateId
        ),
    };
};

export const DeepDiveView = connect(mapStateToProps)(
    MemoizedInternalDeepDiveView
);
