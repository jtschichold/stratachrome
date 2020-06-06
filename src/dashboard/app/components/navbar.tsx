import * as React from "react";
import {
    connect,
    MapDispatchToPropsFunction,
    MapDispatchToPropsNonObject,
} from "react-redux";
import { Link, withRouter } from "react-router-dom";
import { RouteComponentProps } from "react-router";

import { State as StoreState, actions } from "../store";
import { Device } from "../../../common/models";
import { Icon } from "../images";

interface NavbarRouteProps {
    serial?: string;
}

interface NavbarStateProps {
    deviceList?: Device[];
}

interface NavbarDispatchProps {
    activateAbout?: () => void;
    activateSettings?: (t: string) => void;
    toggleSidebar?: (newState: boolean) => void;
}

interface State {
    isDevicesMenuActive: boolean;
    isEllipsisMenuActive: boolean;
    isBurgerActive: boolean;
}

export class InternalNavbar extends React.Component<
    RouteComponentProps<NavbarRouteProps> &
        NavbarStateProps &
        NavbarDispatchProps,
    State
> {
    private devicesMenuRef: React.RefObject<HTMLDivElement> = React.createRef();
    private ellipsisMenuRef: React.RefObject<
        HTMLDivElement
    > = React.createRef();

    state: State = {
        isDevicesMenuActive: false,
        isEllipsisMenuActive: false,
        isBurgerActive: false,
    };

    componentWillUnmount() {
        window.removeEventListener(
            "mousedown",
            this.windowDevicesClickListener
        );
        window.removeEventListener(
            "mousedown",
            this.windowEllipsisClickListener
        );
        this.devicesMenuRef = null;
        this.ellipsisMenuRef = null;
    }

    render() {
        let { serial } = this.props.match.params;
        let { isEllipsisMenuActive, isBurgerActive } = this.state;

        return (
            <nav
                className="navbar is-fixed-top"
                role="navigation"
                aria-label="main navigation"
            >
                <div className="navbar-brand">
                    {serial && (
                        <a
                            role="button"
                            className={`navbar-burger ${
                                isBurgerActive ? "is-active" : ""
                            }`}
                            onClick={this.toggleBurger}
                            aria-label="menu"
                            aria-expanded="false"
                        >
                            <span aria-hidden="true"></span>
                            <span aria-hidden="true"></span>
                            <span aria-hidden="true"></span>
                        </a>
                    )}
                    <a
                        className="navbar-item stratachrome-brand"
                        href="dashboard.html"
                        title="Alessia"
                    >
                        <Icon.AlessiaNegative className="brand-icon" />
                    </a>
                </div>
                <div className="navbar-menu is-active">
                    <div className="navbar-start">
                        <Link
                            to="/dashboard.html"
                            className="navbar-item is-size-5 has-text-weight-semibold"
                        >
                            <span>Devices</span>
                        </Link>
                        {serial && (
                            <div className="navbar-item pr-0 pl-0 is-size-5 has-text-weight-semibold">
                                <span className="icon">
                                    <i className="fas fa-angle-right"></i>
                                </span>
                            </div>
                        )}
                        {serial && this.renderDeviceMenu()}
                    </div>
                    <div className="navbar-end">
                        <div
                            className={`navbar-item has-dropdown ${
                                isEllipsisMenuActive ? "is-active" : ""
                            }`}
                        >
                            <a
                                title="More stuff"
                                className="navbar-link is-arrowless mr-1"
                                onClick={this.activateEllipsisMenu}
                                style={{
                                    borderColor: "transparent",
                                    borderRadius: "50%",
                                }}
                            >
                                <span className="icon">
                                    <i className="fas fa-ellipsis-v fa-lg"></i>
                                </span>
                            </a>
                            <div
                                className="navbar-dropdown is-right"
                                ref={this.ellipsisMenuRef}
                            >
                                <a
                                    className="navbar-item is-size-6"
                                    onClick={this.showAbout}
                                >
                                    About
                                </a>
                                <hr className="navbar-divider" />
                                <a
                                    className="navbar-item is-size-6"
                                    onClick={this.showSettings}
                                >
                                    Settings
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        );
    }

    private renderDeviceMenu() {
        let { deviceList } = this.props;
        let { serial } = this.props.match.params;
        let { isDevicesMenuActive } = this.state;

        let name: string = "N/A";
        let sortedDL = deviceList.sort((a, b) =>
            a.deviceName.localeCompare(b.deviceName)
        );

        let myDevice = deviceList.find((d) => d.serial === serial);
        if (myDevice && myDevice.deviceName) {
            name = myDevice.deviceName;
        }

        let menu = (
            <div
                className={`navbar-item has-dropdown ${
                    isDevicesMenuActive && "is-active"
                }`}
            >
                <div
                    className="navbar-link is-size-5 has-text-weight-semibold is-arrowless"
                    onClick={this.activateDevicesMenu}
                >
                    <span>{name}</span>
                    <span className="icon ml-1">
                        <i className="fas fa-caret-down"></i>
                    </span>
                </div>
                <div
                    className="navbar-dropdown"
                    ref={this.devicesMenuRef}
                    style={{ zIndex: 33 }}
                >
                    {sortedDL &&
                        sortedDL.map((d) => (
                            <Link
                                to={`/device/${d.serial}`}
                                className="navbar-item is-size-6"
                            >
                                {d.deviceName}
                            </Link>
                        ))}
                </div>
            </div>
        );

        return menu;
    }

    private activateDevicesMenu = (e: React.MouseEvent) => {
        this.setState({
            ...this.state,
            isDevicesMenuActive: true,
        });
        window.addEventListener("mousedown", this.windowDevicesClickListener);
    };

    private windowDevicesClickListener = (e: MouseEvent) => {
        if (
            this.devicesMenuRef &&
            !this.devicesMenuRef.current.contains(e.target as Node)
        ) {
            this.setState({
                ...this.state,
                isDevicesMenuActive: false,
            });
            window.removeEventListener(
                "mousedown",
                this.windowDevicesClickListener
            );
        }
    };

    private activateEllipsisMenu = (e: React.MouseEvent) => {
        this.setState({
            ...this.state,
            isEllipsisMenuActive: true,
        });
        window.addEventListener("mousedown", this.windowEllipsisClickListener);
    };

    private windowEllipsisClickListener = (e: MouseEvent) => {
        if (
            this.ellipsisMenuRef &&
            !this.ellipsisMenuRef.current.contains(e.target as Node)
        ) {
            this.setState({
                ...this.state,
                isEllipsisMenuActive: false,
            });
            window.removeEventListener(
                "mousedown",
                this.windowEllipsisClickListener
            );
        }
    };

    private showAbout = () => {
        this.setState({
            ...this.state,
            isEllipsisMenuActive: false,
        });

        this.props.activateAbout();
    };

    private showSettings = () => {
        this.setState({
            ...this.state,
            isEllipsisMenuActive: false,
        });

        this.props.activateSettings(
            this.props.match.params.serial || "general"
        );
    };

    private toggleBurger = () => {
        let newIsBurgerActive = !this.state.isBurgerActive;

        this.setState({
            ...this.state,
            isBurgerActive: newIsBurgerActive,
        });

        this.props.toggleSidebar(newIsBurgerActive);
    };
}

const mapStateToProps = (
    state: StoreState,
    props: RouteComponentProps<NavbarRouteProps>
): NavbarStateProps => {
    return {
        deviceList: state.devices.deviceList,
    };
};

const mapDispatchToProps: MapDispatchToPropsFunction<
    NavbarDispatchProps,
    {}
> = (dispatch) => {
    return {
        activateAbout: () => dispatch(actions.state.upsert("aboutState", true)),
        activateSettings: (t: string) =>
            dispatch(actions.state.upsert("settingsState", t)),
        toggleSidebar: (newState: boolean) =>
            dispatch(actions.state.upsert("sidebarState", newState)),
    };
};

export const Navbar = withRouter(
    connect(mapStateToProps, mapDispatchToProps)(InternalNavbar)
);
