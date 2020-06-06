import * as React from "react";
import { useForm } from "react-hook-form";
import { LocalStorageConfig } from "../../../../common/lib/localstorageconfig";
import { Config } from "../../../../common/models";
import { SettingsChangesContext } from "./context";

/*
    notificationTimeout?: number;
    trackingInterval?: number;
    pollingDefault?: number;
    jobsTrackingInterval?: number;
    ifsTrackingInterval?: number;
    requestTimeout?: number;
    maxRunningReq?: number;
    filteredJobs?: string[];
    maxHistory?: number;
*/

export const GeneralSettings: React.FunctionComponent<React.HTMLAttributes<
    HTMLDivElement
>> = (props) => {
    const { errors, register, formState, reset, getValues } = useForm({
        mode: "onChange",
    });
    const { dirty, isValid } = formState;
    const context = React.useContext(SettingsChangesContext);
    const [localStorageConfig, setLocalStorageConfig] = React.useState<Config>(
        new LocalStorageConfig()
    );

    React.useEffect(() => {
        reset({
            ...localStorageConfig,
            ...context.generalSettings,
        });
    }, [localStorageConfig]);

    React.useEffect(() => {
        let values = getValues();
        formState.dirtyFields.forEach((attr) => {
            if (errors[attr]) return;

            let value = Number(values[attr]);

            if (context.generalSettings[attr] === value) return;

            if (Number(values[attr]) !== localStorageConfig[attr]) {
                context.setConfigAttribute(attr, Number(values[attr]));
            }
        });
    });

    const onReset = () => {
        context.resetConfig();
        reset({
            ...localStorageConfig,
        });
    };

    const onSave = () => {
        if (!isValid) return;

        let changed = false;
        Object.entries(context.generalSettings).forEach(([attr, value]) => {
            LocalStorageConfig.set(attr, "" + value);
            changed = true;
        });

        if (changed) {
            chrome.runtime.sendMessage({
                cmd: "readconfig",
            });
        }

        context.resetConfig();
        setLocalStorageConfig(new LocalStorageConfig());
    };

    let isChanged = Object.keys(context.generalSettings).length !== 0;
    let saveDisabled = !isValid || !isChanged;

    return (
        <div {...props} className="is-flex-column">
            <nav className="level settings-title">
                <div className="level-left">
                    <div className="level-item">General Settings</div>
                </div>
                <div className="level-right">
                    <div className="level-item">
                        <button
                            className="button is-small"
                            onClick={onReset}
                            disabled={!isChanged}
                        >
                            Reset
                        </button>
                    </div>
                    <div className="level-item">
                        <button
                            className="button is-primary is-small"
                            onClick={onSave}
                            disabled={saveDisabled}
                        >
                            Save
                        </button>
                    </div>
                </div>
            </nav>
            <div className="settings-group">
                <div className="field">
                    <label className="label">
                        <span>Tracking Interval (s)</span>
                        {context.generalSettings.trackingInterval && (
                            <span className="icon is-small pl-3 is-size-7">
                                <i className="fas fa-circle fa-xs" />
                            </span>
                        )}
                    </label>
                    <div className="control">
                        <input
                            className="input is-small"
                            type="text"
                            name="trackingInterval"
                            ref={register({
                                required: {
                                    value: true,
                                    message: "Tracking Interval is required",
                                },
                                pattern: {
                                    value: /^[0-9]+$/i,
                                    message:
                                        "Tracking Interval should be a positive number",
                                },
                            })}
                        />
                        {errors?.trackingInterval?.message && (
                            <p className="help is-danger">
                                {errors.trackingInterval.message}
                            </p>
                        )}
                    </div>
                </div>
                <div className="field">
                    <label className="label">
                        <span>Interfaces Tracking Interval (s)</span>
                        {context.generalSettings.ifsTrackingInterval && (
                            <span className="icon is-small pl-3 is-size-7">
                                <i className="fas fa-circle fa-xs" />
                            </span>
                        )}
                    </label>
                    <div className="control">
                        <input
                            className="input is-small"
                            type="text"
                            name="ifsTrackingInterval"
                            ref={register({
                                required: {
                                    value: true,
                                    message:
                                        "Interfaces Tracking Interval is required",
                                },
                                pattern: {
                                    value: /^[0-9]+$/i,
                                    message:
                                        "Interfaces Tracking Interval should be a positive number",
                                },
                            })}
                        />
                        {errors?.ifsTrackingInterval?.message && (
                            <p className="help is-danger">
                                {errors.ifsTrackingInterval.message}
                            </p>
                        )}
                    </div>
                </div>
                <div className="field">
                    <label className="label">
                        <span>Request Timeout (s)</span>
                        {context.generalSettings.requestTimeout && (
                            <span className="icon is-small pl-3 is-size-7">
                                <i className="fas fa-circle fa-xs" />
                            </span>
                        )}
                    </label>
                    <div className="control">
                        <input
                            className="input is-small"
                            type="text"
                            name="requestTimeout"
                            ref={register({
                                required: {
                                    value: true,
                                    message: "Request Timeout is required",
                                },
                                pattern: {
                                    value: /^[0-9]+$/i,
                                    message:
                                        "Request Timeout should be a positive number",
                                },
                            })}
                        />
                        {errors?.requestTimeout?.message && (
                            <p className="help is-danger">
                                {errors.requestTimeout.message}
                            </p>
                        )}
                    </div>
                </div>
                <div className="field">
                    <label className="label">
                        <span>Max Concurrent Requests</span>
                        {context.generalSettings.maxRunningReq && (
                            <span className="icon is-small pl-3 is-size-7">
                                <i className="fas fa-circle fa-xs" />
                            </span>
                        )}
                    </label>
                    <div className="control">
                        <input
                            className="input is-small"
                            type="text"
                            name="maxRunningReq"
                            ref={register({
                                required: {
                                    value: true,
                                    message:
                                        "Max Concurrent Requests is required",
                                },
                                pattern: {
                                    value: /^[0-9]+$/i,
                                    message:
                                        "Max Concurrent Requests should be a positive number",
                                },
                            })}
                        />
                        {errors?.maxRunningReq?.message && (
                            <p className="help is-danger">
                                {errors.maxRunningReq.message}
                            </p>
                        )}
                    </div>
                </div>
                <div className="field">
                    <label className="label">
                        <span>Notification Timeout (s)</span>
                        {context.generalSettings.notificationTimeout && (
                            <span className="icon is-small pl-3 is-size-7">
                                <i className="fas fa-circle fa-xs" />
                            </span>
                        )}
                    </label>
                    <div className="control">
                        <input
                            className="input is-small"
                            type="text"
                            name="notificationTimeout"
                            ref={register({
                                required: {
                                    value: true,
                                    message: "Notification Timeout is required",
                                },
                                pattern: {
                                    value: /^[0-9]+$/i,
                                    message:
                                        "Notification Timeout should be a positive number",
                                },
                            })}
                        />
                        {errors?.notificationTimeout?.message && (
                            <p className="help is-danger">
                                {errors.notificationTimeout.message}
                            </p>
                        )}
                    </div>
                </div>
                <div className="field">
                    <label className="label">
                        <span>History Retention (hours)</span>
                        {context.generalSettings.maxHistory && (
                            <span className="icon is-small pl-3 is-size-7">
                                <i className="fas fa-circle fa-xs" />
                            </span>
                        )}
                    </label>
                    <div className="control">
                        <input
                            className="input is-small"
                            type="text"
                            name="maxHistory"
                            ref={register({
                                required: {
                                    value: true,
                                    message: "History Retention is required",
                                },
                                pattern: {
                                    value: /^[0-9]+$/i,
                                    message:
                                        "History Retention should be a positive number",
                                },
                            })}
                        />
                        {errors?.maxHistory?.message && (
                            <p className="help is-danger">
                                {errors.maxHistory.message}
                            </p>
                        )}
                    </div>
                </div>
                <div className="field">
                    <label className="label">
                        <span>High CPU Threshold (%)</span>
                        {context.generalSettings.highCpuThreshold && (
                            <span className="icon is-small pl-3 is-size-7">
                                <i className="fas fa-circle fa-xs" />
                            </span>
                        )}
                    </label>
                    <div className="control">
                        <input
                            className="input is-small"
                            type="text"
                            name="highCpuThreshold"
                            ref={register({
                                required: {
                                    value: true,
                                    message: "High CPU Threshold is required",
                                },
                                pattern: {
                                    value: /^[0-9]+$/i,
                                    message:
                                        "High CPU Threshold should be a positive number",
                                },
                                max: {
                                    value: 100,
                                    message:
                                        "High CPU Threshold should be a positive number between 0 and 100",
                                },
                            })}
                        />
                        {errors?.highCpuThreshold?.message && (
                            <p className="help is-danger">
                                {errors.highCpuThreshold.message}
                            </p>
                        )}
                    </div>
                </div>
                <div className="field">
                    <label className="label">
                        <span>High Memory Threshold (%)</span>
                        {context.generalSettings.highMemoryThreshold && (
                            <span className="icon is-small pl-3 is-size-7">
                                <i className="fas fa-circle fa-xs" />
                            </span>
                        )}
                    </label>
                    <div className="control">
                        <input
                            className="input is-small"
                            type="text"
                            name="highMemoryThreshold"
                            ref={register({
                                required: {
                                    value: true,
                                    message:
                                        "High Memory Threshold is required",
                                },
                                pattern: {
                                    value: /^[0-9]+$/i,
                                    message:
                                        "High Memory Threshold should be a positive number",
                                },
                                max: {
                                    value: 100,
                                    message:
                                        "High Memory Threshold should be a positive number between 0 and 100",
                                },
                            })}
                        />
                        {errors?.highMemoryThreshold?.message && (
                            <p className="help is-danger">
                                {errors.highMemoryThreshold.message}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
