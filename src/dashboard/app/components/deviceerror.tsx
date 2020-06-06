import * as React from "react";
import { connect } from "react-redux";
import { RouteComponentProps } from "react-router";
import { NavLink, useHistory, withRouter } from "react-router-dom";

import { DeepDiveInstance, Device } from "../../../common/models";
import { State as StoreState } from "../store";
import { Icon } from "../images";

interface RProps {
    serial?: string;
}

interface SProps {
    device?: Device;
}

const InternalDeviceError: React.FunctionComponent<
    RouteComponentProps<RProps> & SProps
> = (props) => {
    let { device } = props;
    const [retryDisabled, setRetryDisabled] = React.useState(false);

    if (Object.keys(device.error).length === 0) return null;

    let error = Object.values(device.error)[0];

    const onClick = () => {
        chrome.runtime.sendMessage({
            cmd: "poll",
            serial: device.serial,
        });
        setRetryDisabled(true);
    };

    return (
        <div className="notification is-danger is-top-notification is-flex-center">
            <span className="pr-1">
                {error} - Check if device is reachable:
            </span>
            <a className="pr-1" href={device.url} target="_blank">
                {device.url}
            </a>
            <span className="pr-1">and</span>
            <button
                disabled={retryDisabled}
                className="button is-inverted is-outlined is-danger is-small"
                onClick={onClick}
            >
                Retry
            </button>
        </div>
    );
};

const mapStateToProps = (
    state: StoreState,
    props: RouteComponentProps<RProps>
): SProps => {
    let { serial } = props.match.params;
    if (!serial) {
        return {
            device: null,
        };
    }

    return {
        device: state.devices.deviceList.find((d) => d.serial === serial),
    };
};

export const DeviceError = withRouter(
    connect(mapStateToProps)(InternalDeviceError)
);
