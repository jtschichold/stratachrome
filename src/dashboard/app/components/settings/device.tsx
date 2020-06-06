import * as React from "react";
import {
    MapStateToProps,
    connect,
    MapDispatchToPropsFunction,
} from "react-redux";
import { DevicePreference, OptionalPoller } from "../../../../common/models";
import { State, actions } from "../../store";
import { SettingsChangesContext } from "./context";

interface DeviceSettingsState {
    enabledOptionalPollers: DevicePreference["enabledOptionalPollers"];
    optionalPollers: OptionalPoller[];
}

interface DeviceSettingsDispatchProps {
    disableOptionalPoller: (serial: string, id: string) => {};
    enableOptionalPoller: (serial: string, id: string) => {};
}

export interface DeviceSettingsOwnProps {
    deviceName: string;
    serial: string;
}

type DeviceSettingsBaseProps = DeviceSettingsOwnProps &
    React.HTMLAttributes<HTMLDivElement>;

const InternalDeviceSettings: React.FunctionComponent<
    DeviceSettingsBaseProps & DeviceSettingsState & DeviceSettingsDispatchProps
> = (props) => {
    const changes = React.useContext(SettingsChangesContext);

    let {
        serial,
        enabledOptionalPollers,
        optionalPollers,
        disableOptionalPoller,
        enableOptionalPoller,
        deviceName,
        ...divProps
    } = props;

    const onOpChange = (id: string, v: "Enabled" | "Disabled") => {
        changes.changeOptionalPoller({
            serial,
            id,
            state: v,
        });
    };

    const getChange = (id: string) =>
        changes.deviceSettings.find((c) => c.id === id && c.serial === serial);

    const isOPEnabled = (id: string): boolean => {
        let change = getChange(id);
        if (change) {
            return change.state === "Enabled";
        }

        return enabledOptionalPollers.indexOf(id) !== -1;
    };

    const onReset = () => {
        changes.resetDevice(serial);
    };

    const onSave = () => {
        let changed: boolean = false;

        changes.deviceSettings
            .filter((c) => c.serial === serial)
            .forEach((change) => {
                if (
                    change.state === "Enabled" &&
                    enabledOptionalPollers.indexOf(change.id) === -1
                ) {
                    enableOptionalPoller(serial, change.id);
                    changed = true;
                    return;
                }

                if (
                    change.state === "Disabled" &&
                    enabledOptionalPollers.indexOf(change.id) !== -1
                ) {
                    disableOptionalPoller(serial, change.id);
                    changed = true;
                    return;
                }
            });

        changes.resetDevice(serial);

        if (changed) {
            chrome.runtime.sendMessage({
                cmd: "readmetadata",
            });
        }
    };

    return (
        <div {...divProps} className="is-flex-column">
            <nav className="level settings-title">
                <div className="level-left">
                    <div className="level-item">
                        Settings for device{" "}
                        {deviceName ? `${deviceName} (${serial})` : serial}
                    </div>
                </div>
                <div className="level-right">
                    <div className="level-item">
                        <button
                            className="button is-small"
                            disabled={
                                changes.deviceSettings.findIndex(
                                    (c) => c.serial === serial
                                ) === -1
                            }
                            onClick={onReset}
                        >
                            Reset
                        </button>
                    </div>
                    <div className="level-item">
                        <button
                            className="button is-primary is-small"
                            onClick={onSave}
                            disabled={
                                changes.deviceSettings.findIndex(
                                    (c) => c.serial === serial
                                ) === -1
                            }
                        >
                            Save
                        </button>
                    </div>
                </div>
            </nav>
            <div className="settings-group">
                {optionalPollers.map((op) => (
                    <OptionalPollerSelect
                        enabled={isOPEnabled(op.id)}
                        changed={typeof getChange(op.id) !== "undefined"}
                        optionalPoller={op}
                        onChange={onOpChange}
                    />
                ))}
            </div>
        </div>
    );
};

const OptionalPollerSelect: React.FunctionComponent<{
    enabled: boolean;
    changed: boolean;
    optionalPoller: OptionalPoller;
    onChange: (id: string, nv: "Enabled" | "Disabled") => void;
}> = (props) => {
    let { optionalPoller, enabled, changed, onChange } = props;

    const selectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange(optionalPoller.id, e.target.value as any);
    };

    return (
        <div className="field">
            <label className="label">
                <span>Monitor {optionalPoller.description}</span>
                {changed && (
                    <span className="icon is-small pl-3 is-size-7">
                        <i className="fas fa-circle fa-xs" />
                    </span>
                )}
            </label>
            <div className="control">
                <div className="select is-small">
                    <select
                        value={enabled ? "Enabled" : "Disabled"}
                        onChange={selectChange}
                    >
                        <option value="Enabled">Enabled</option>
                        <option value="Disabled">Disabled</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

const mapDispatchToProps: MapDispatchToPropsFunction<
    DeviceSettingsDispatchProps,
    {}
> = (dispatch) => {
    return {
        enableOptionalPoller: (serial: string, id: string) =>
            dispatch(actions.preferences.optionalPollerUpsert(serial, id)),
        disableOptionalPoller: (serial: string, id: string) =>
            dispatch(actions.preferences.optionalPollerRemove(serial, id)),
    };
};

const mapStateToProps: MapStateToProps<
    DeviceSettingsState,
    DeviceSettingsOwnProps,
    State
> = (state: State, props: DeviceSettingsOwnProps) => {
    return {
        enabledOptionalPollers:
            state.preferences.preferences.find((p) => p.serial === props.serial)
                ?.enabledOptionalPollers || [],
        optionalPollers: state.metadata.optionalPollers,
    };
};

export const DeviceSettings = connect(
    mapStateToProps,
    mapDispatchToProps
)(InternalDeviceSettings);
