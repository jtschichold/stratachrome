import * as React from "react";
import { connect, MapDispatchToPropsFunction } from "react-redux";
import { RouteComponentProps } from "react-router";
import { Route, Redirect, Switch } from "react-router-dom";

import { actions, State as StoreState } from "../../store";
import { MetricListManager } from "../../lib/metrichandlers";
import { MainGrid } from "../maingrid";

import {
    Device,
    DeepDiveTemplateParameter,
    DeepDiveInstance,
} from "../../../../common/models";
import { SVGGradients, EasyPieSVGGradients } from "../charts";
import {
    DataPlaneDetails,
    Interfaces,
    CounterGlobal,
    Overview,
    Resources,
    DeepDiveView,
    DeepDiveViewRouteProps,
    DeepDiveLightbox,
    DeepDiveLightBoxSessionState,
} from "./components";

interface DeviceViewRouteProps {
    serial?: string;
}

interface DeviceViewOwnProps {
    device: Device;
    path: string;
    url: string;
    deepdives: DeepDiveInstance[];
    ddlboxState?: DeepDiveLightBoxSessionState;
}

interface DeviceViewDispatchProps {
    activateDDLBox?: (p: DeepDiveTemplateParameter) => void;
}

const InternalDeviceView: React.FunctionComponent<
    DeviceViewRouteProps & DeviceViewOwnProps & DeviceViewDispatchProps
> = (props) => {
    let { device, path, activateDDLBox, ddlboxState } = props;

    const [initialized, setInitialized] = React.useState(false);
    const [metricListManager, setMetricListManager] = React.useState<
        MetricListManager
    >(null);

    const renderDeepDive = (
        props: RouteComponentProps<DeepDiveViewRouteProps>
    ) => {
        return (
            <DeepDiveView
                key={props.match.params.id}
                metricListManager={metricListManager}
                device={device}
                {...props}
            />
        );
    };

    const activateDDL = (param: DeepDiveTemplateParameter) => {
        activateDDLBox(param);
    };

    React.useEffect(() => {
        let mlManager = new MetricListManager();
        let initPromise: Promise<any> = mlManager.init(props.device);

        initPromise.then(
            () => {
                setInitialized(true);
            },
            (err) => {
                console.log("Error during initalization: " + err);
            }
        );
        setMetricListManager(mlManager);

        return () => {
            mlManager.cancel();
        };
    }, []);

    // default template as overview
    if (!initialized) return MainGrid.loadingTemplate([2, 2, 1, 1], true);

    return (
        <>
            <Switch>
                <Route path={`${path}/overview`}>
                    <Overview
                        metricListManager={metricListManager}
                        device={device}
                    />
                </Route>
                <Route path={`${path}/dataplanedetails`}>
                    <DataPlaneDetails device={device} />
                </Route>
                <Route path={`${path}/interfaces`}>
                    <Interfaces activateDDL={activateDDL} device={device} />
                </Route>
                <Route path={`${path}/counterglobal`}>
                    <CounterGlobal activateDDL={activateDDL} device={device} />
                </Route>
                <Route path={`${path}/resources`}>
                    <Resources
                        metricListManager={metricListManager}
                        device={device}
                    />
                </Route>
                <Route path={`${path}/deepdive/:id?`} render={renderDeepDive} />
                <Redirect to={`${path}/overview`} />
            </Switch>
            <DeepDiveLightbox
                key={
                    "ddlBox" +
                    (ddlboxState?.target || "") +
                    (ddlboxState?.templateId || "") +
                    (ddlboxState?.parameterValue?.type || "") +
                    (ddlboxState?.parameterValue?.value || "")
                }
                device={device}
                metricListManager={metricListManager}
            />
            <SVGGradients />
            <EasyPieSVGGradients />
        </>
    );
};

const mapStateToProps = (
    state: StoreState,
    props: RouteComponentProps<DeviceViewRouteProps>
): DeviceViewOwnProps => {
    let devicePreference = state.preferences.preferences.find(
        (p) => p.serial === props.match.params.serial
    );

    let ddlboxState = state.session.find(
        ({ key, value }) => key === "ddlboxState"
    )?.value;

    return {
        device: state.devices.deviceList.find(
            (d) => d.serial === props.match.params.serial
        ),
        path: props.match.path,
        url: props.match.url,
        deepdives: devicePreference?.deepdives || [],
        ddlboxState,
    };
};

const mapDispatchToProps: MapDispatchToPropsFunction<
    DeviceViewDispatchProps,
    {}
> = (dispatch) => {
    return {
        activateDDLBox: (p: DeepDiveTemplateParameter) =>
            dispatch(
                actions.state.upsert("ddlboxState", {
                    target: "parameter",
                    parameterValue: {
                        type: p.type,
                        value: p.name,
                    },
                })
            ),
    };
};

export const DeviceView = connect(
    mapStateToProps,
    mapDispatchToProps
)(InternalDeviceView);
