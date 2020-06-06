import * as React from "react";
import {
    connect,
    MapDispatchToPropsFunction,
    MapStateToProps,
} from "react-redux";
import { State as StoreState, actions } from "../../store";
import { getKnownSerials } from "../../lib/selectors";

import { GeneralSettings } from "./general";
import { DeviceSettings } from "./device";
import {
    SettingsChangesContext,
    SettingsChanges,
    SettingsChangesMethods,
} from "./context";

export interface SettingsState {
    target: string;
    deviceSerials: { name: string; serial: string }[];
}

interface SettingsOwnProps extends SettingsState {}

interface SettingsDispatchProps {
    deactivateSettings?: () => void;
}

export const InternalSettings: React.FunctionComponent<
    SettingsOwnProps & SettingsDispatchProps
> = (props) => {
    let { target, deviceSerials, deactivateSettings } = props;
    const [display, setDisplay] = React.useState(false);
    const [activeSerial, setActiveSerial] = React.useState(target);
    const [settingsChanges, setSettingsChanges] = React.useState<
        SettingsChanges
    >({
        generalSettings: {},
        deviceSettings: [],
    });

    React.useEffect(() => {
        if (target && !display) {
            setDisplay(true);
            return;
        }

        if (!target && display) {
            setDisplay(false);
            return;
        }
    }, [target]);

    React.useEffect(() => {
        setActiveSerial(target);
    }, [target]);

    const onCancel = () => {
        deactivateSettings();
    };

    const changeOptionalPoller: SettingsChangesMethods["changeOptionalPoller"] = (
        change
    ) => {
        setSettingsChanges({
            ...settingsChanges,
            deviceSettings: [
                ...settingsChanges.deviceSettings.filter(
                    (dp) => dp.serial !== change.serial || dp.id !== change.id
                ),
                change,
            ],
        });
    };

    const setConfigAttribute: SettingsChangesMethods["setConfigAttribute"] = (
        attr,
        value
    ) => {
        let newGeneralSettings = {
            ...settingsChanges.generalSettings,
        };
        newGeneralSettings[attr] = value;

        setSettingsChanges({
            ...settingsChanges,
            generalSettings: newGeneralSettings,
        });
    };

    const resetConfig: SettingsChangesMethods["resetConfig"] = () => {
        setSettingsChanges({
            ...settingsChanges,
            generalSettings: {},
        });
    };

    const resetDevice: SettingsChangesMethods["resetDevice"] = (serial) => {
        setSettingsChanges({
            ...settingsChanges,
            deviceSettings: settingsChanges.deviceSettings.filter(
                (dp) => dp.serial !== serial
            ),
        });
    };

    return (
        <div style={{}} className={`modal ${display ? "is-active" : ""}`}>
            <div className="modal-background"></div>
            <div className="modal-card has-width-fit-content">
                <header className="modal-card-head">
                    <div className="modal-card-title">Settings</div>
                    <button
                        className="delete is-medium"
                        aria-label="close"
                        onClick={onCancel}
                    ></button>
                </header>
                <section className="modal-card-body">
                    <div className="settings">
                        <aside className="pl-0 pt-0 is-sidebar-menu is-active">
                            <ul className="menu-list">
                                <SideBarItem
                                    target="general"
                                    isActive={activeSerial === "general"}
                                    isChanged={
                                        Object.keys(
                                            settingsChanges.generalSettings
                                        ).length !== 0
                                    }
                                    onSelect={setActiveSerial}
                                />
                                {deviceSerials.map((s) => (
                                    <SideBarItem
                                        deviceName={s.name}
                                        target={s.serial}
                                        isActive={activeSerial === s.serial}
                                        onSelect={setActiveSerial}
                                        isChanged={
                                            settingsChanges.deviceSettings.findIndex(
                                                (dp) => dp.serial === s.serial
                                            ) !== -1
                                        }
                                    />
                                ))}
                            </ul>
                        </aside>
                        <div className="pl-8 settings-view">
                            <SettingsChangesContext.Provider
                                value={{
                                    ...settingsChanges,
                                    setConfigAttribute,
                                    changeOptionalPoller,
                                    resetDevice,
                                    resetConfig,
                                }}
                            >
                                {activeSerial === "general" && (
                                    <GeneralSettings />
                                )}
                                {activeSerial && activeSerial !== "general" && (
                                    <DeviceSettings
                                        deviceName={
                                            deviceSerials.find(
                                                (d) => d.serial === activeSerial
                                            )?.name
                                        }
                                        serial={activeSerial}
                                        key={activeSerial}
                                    />
                                )}
                            </SettingsChangesContext.Provider>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

const SideBarItem: React.FunctionComponent<{
    deviceName?: string;
    target: string;
    isActive: boolean;
    isChanged: boolean;
    onSelect: (t: string) => void;
}> = (props) => {
    let { target, isActive, isChanged, onSelect, deviceName } = props;

    const onClick = () => {
        onSelect(target);
    };

    if (!deviceName) {
        deviceName = target === "general" ? "General" : target;
    }

    return (
        <li className={`${isActive ? "active" : ""}`}>
            <a
                className={`pl-1 is-flex-center ${isActive ? "is-active" : ""}`}
                onClick={onClick}
            >
                <span>{deviceName}</span>
                {isChanged && (
                    <span className="icon is-small pl-3 is-size-7">
                        <i className="fas fa-circle fa-xs" />
                    </span>
                )}
            </a>
        </li>
    );
};

const mapDispatchToProps: MapDispatchToPropsFunction<
    SettingsDispatchProps,
    {}
> = (dispatch) => {
    return {
        deactivateSettings: () =>
            dispatch(actions.state.upsert("settingsState", null)),
    };
};

const mapStateToProps: MapStateToProps<
    SettingsState,
    SettingsOwnProps,
    StoreState
> = (state: StoreState, props: SettingsOwnProps) => {
    return {
        target: state.session.find(({ key, value }) => key === "settingsState")
            ?.value,
        deviceSerials: getKnownSerials(state),
    };
};

export const Settings = connect(
    mapStateToProps,
    mapDispatchToProps
)(InternalSettings);
