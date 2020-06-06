import * as React from "react";
import { connect, MapDispatchToPropsFunction } from "react-redux";
import { RouteComponentProps } from "react-router";
import { NavLink, withRouter } from "react-router-dom";

import { DeepDiveInstance, Device } from "../../../common/models";
import { actions, State as StoreState } from "../store";
import { Icon } from "../images";

interface SidebarRouteProps {
    serial?: string;
}

interface SidebarStateProps {
    device?: Device;
    deepdives?: DeepDiveInstance[];
    isSiderbarActive?: boolean;
}

interface SidebarDispatchProps {
    activateDDLBox?: () => void;
}

const InternalSidebar: React.FunctionComponent<
    RouteComponentProps<SidebarRouteProps> &
        SidebarDispatchProps &
        SidebarStateProps
> = (props) => {
    let { url } = props.match;
    let { deepdives, device, isSiderbarActive, activateDDLBox } = props;

    return (
        <aside
            className={`is-sidebar-menu ${device ? "is-active-desktop" : ""} ${
                isSiderbarActive ? "is-active-lt-desktop" : ""
            }`}
        >
            <p className="menu-label">Dashboards</p>
            <ul className="menu-list">
                <li>
                    <NavLink
                        className="pl-1 is-flex"
                        activeClassName="is-active"
                        to={`${url}/overview`}
                    >
                        <span className="icon">
                            <Icon.Monitor className="si" />
                        </span>
                        <span className="pl-1 is-inline-flex-center">
                            Overview
                        </span>
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        className="pl-1 is-flex"
                        activeClassName="is-active"
                        to={`${url}/resources`}
                    >
                        <span className="icon">
                            <Icon.Resources className="si" />
                        </span>
                        <span className="pl-1 is-inline-flex-center">
                            Resources
                        </span>
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        className="pl-1 is-flex"
                        activeClassName="is-active"
                        to={`${url}/interfaces`}
                    >
                        <span className="icon">
                            <Icon.NetworkIf className="si" />
                        </span>
                        <span className="pl-1 is-inline-flex-center">
                            Traffic Details
                        </span>
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        className="pl-1 is-flex"
                        activeClassName="is-active"
                        to={`${url}/dataplanedetails`}
                    >
                        <span className="icon">
                            <Icon.Dp className="si" />
                        </span>
                        <span className="pl-1 is-inline-flex-center">
                            DP Details
                        </span>
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        className="pl-1 is-flex"
                        activeClassName="is-active"
                        to={`${url}/counterglobal`}
                    >
                        <span className="icon">
                            <Icon.Counters className="si" />
                        </span>
                        <span className="pl-1 is-inline-flex-center">
                            Counters
                        </span>
                    </NavLink>
                </li>
            </ul>
            <p className="menu-label">Deep Dives</p>
            <ul className="menu-list">
                {deepdives.map((ddi) => (
                    <li>
                        <NavLink
                            className="pl-1 is-flex"
                            activeClassName="is-active"
                            to={`${url}/deepdive/${ddi.id}`}
                            title={ddi.name}
                        >
                            <span className="icon not-flex-shrink">
                                <Icon.DeepDive className="si" />
                            </span>
                            <span className="pl-1 is-inline-flex-center has-overflow-hidden">
                                <div className="has-overflow-ellipsis">
                                    {ddi.name}
                                </div>
                            </span>
                        </NavLink>
                    </li>
                ))}
            </ul>
            <button
                className="button is-link is-outlined mt-2"
                onClick={activateDDLBox}
            >
                <span className="icon">
                    <i className="fas fa-xs fa-plus"></i>
                </span>
                <span>Add Deep Dive</span>
            </button>
        </aside>
    );
};

const mapStateToProps = (
    state: StoreState,
    props: RouteComponentProps<SidebarRouteProps>
): SidebarStateProps => {
    let { serial } = props.match.params;
    if (!serial) {
        return {
            device: null,
            deepdives: [],
            isSiderbarActive: false,
        };
    }

    let devicePreference = state.preferences.preferences.find(
        (p) => p.serial === serial
    );

    return {
        device: state.devices.deviceList.find((d) => d.serial === serial),
        deepdives: devicePreference?.deepdives || [],
        isSiderbarActive: state.session.find(
            ({ key, value }) => key === "sidebarState"
        )?.value,
    };
};

const mapDispatchToProps: MapDispatchToPropsFunction<
    SidebarDispatchProps,
    {}
> = (dispatch) => {
    return {
        activateDDLBox: () =>
            dispatch(
                actions.state.upsert("ddlboxState", { target: "overview" })
            ),
    };
};

export const Sidebar = withRouter(
    connect(mapStateToProps, mapDispatchToProps)(InternalSidebar)
);
