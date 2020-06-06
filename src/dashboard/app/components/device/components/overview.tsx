import * as React from "react";

import { Device, DPPoint } from "../../../../../common/models";
import { StatsDB } from "../../../../../common/lib/statsdb";
import { deviceNotificationsReceiver } from "../../../lib/devicenotifications";
import { MetricListManager } from "../../../lib/metrichandlers";
import { HistoryChart } from "../../widgets";
import { MainGrid } from "../../maingrid";

interface Props {
    device: Device;
    metricListManager: MetricListManager;
}

interface State {
    dpPoint: DPPoint | null;
}

export class Overview extends React.Component<Props, State> {
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

        if (!dpPoint) return MainGrid.loadingTemplate([2, 2, 1, 1], false);

        let dps = Object.keys(dpPoint)
            .filter((dp) => dp !== "serial" && dp !== "date")
            .sort();

        return (
            <>
                <HistoryChart
                    metricListManager={metricListManager}
                    metric="ifs:logical:*:ibytes"
                    colorKey={0}
                    targetUnit="bps"
                    gridCellSize={2}
                    gridStartCell={2}
                    binInterval={30}
                    title="Ingress Traffic"
                />
                <HistoryChart
                    metricListManager={metricListManager}
                    metric="ifs:logical:*:obytes"
                    colorKey={1}
                    targetUnit="bps"
                    gridCellSize={2}
                    gridStartCell={2}
                    binInterval={30}
                    title="Egress Traffic"
                />
                <HistoryChart
                    metricListManager={metricListManager}
                    metric="sessions:sessioninfo:numActive"
                    gridCellSize={1}
                    gridStartCell={2}
                    colorKey={2}
                    title="Active Sessions"
                />
                <HistoryChart
                    metricListManager={metricListManager}
                    metric="sessions:sessioninfo:cps"
                    gridStartCell={3}
                    gridCellSize={1}
                    colorKey={3}
                    title="Connections Per Second"
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
