import * as React from "react";

import { Device, DPPoint } from "../../../../../common/models";
import { StatsDB } from "../../../../../common/lib/statsdb";
import { deviceNotificationsReceiver } from "../../../lib/devicenotifications";
import { MetricListManager } from "../../../lib/metrichandlers";
import { MPNow, DPNow } from "../../widgets";
import { MainGrid } from "../../maingrid";

interface Props {
    device: Device;
    metricListManager: MetricListManager;
}

interface State {
    dpPoint: DPPoint | null;
}

export class Resources extends React.Component<Props, State> {
    private listnerId: number = null;

    state: State = {
        dpPoint: null,
    };

    componentDidMount() {
        this.refresh();

        this.listnerId = deviceNotificationsReceiver.addListener(
            this.props.device.serial,
            (utype) => {
                if (utype !== "dp") return;

                this.refresh();
            }
        );
    }

    componentWillUnmount() {
        deviceNotificationsReceiver.removeListener(
            this.props.device.serial,
            this.listnerId
        );
    }

    render() {
        let { dpPoint } = this.state;
        let { device, metricListManager } = this.props;

        if (!dpPoint) return MainGrid.loadingTemplate([2, 2], false);

        let dps = Object.keys(dpPoint)
            .filter((dp) => dp !== "serial" && dp !== "date")
            .sort();

        return (
            <>
                {dps.map((dp) => (
                    <DPNow
                        gridStartCell={2}
                        gridCellSize={2}
                        deviceSerial={device.serial}
                        dp={dp}
                    />
                ))}
                <MPNow
                    gridStartCell={2}
                    gridCellSize={2}
                    deviceSerial={device.serial}
                />
            </>
        );
    }

    private refresh() {
        let statsdb = new StatsDB(this.props.device.serial);
        statsdb.open().then(() => {
            statsdb.getLastElements("dp", 1).then((result) => {
                if (result.length !== 1) return;

                this.setState({
                    ...this.state,
                    dpPoint: result[0] as any,
                });
            });
        });
    }
}
