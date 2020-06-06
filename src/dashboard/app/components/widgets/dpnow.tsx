import * as React from "react";

import { DPPoint, DPStatsPeriod } from "../../../../common/models";
import { StatsDB } from "../../../../common/lib/statsdb";
import { themeVariables } from "../../lib/theme";
import { deviceNotificationsReceiver } from "../../lib/devicenotifications";
import { EasyPieChart, EasyPieChartProps } from "../charts";

import { MainGrid, MainGridCardProps } from "../maingrid";

interface Props {
    deviceSerial: string;
    dp: string;
}

interface State {
    dpPoint: DPPoint | null;
}

export class DPNow extends React.Component<Props & MainGridCardProps, State> {
    private listnerId: number = null;

    state: State = {
        dpPoint: null,
    };

    componentDidMount() {
        this.refresh();

        this.listnerId = deviceNotificationsReceiver.addListener(
            this.props.deviceSerial,
            (utype) => {
                if (utype !== "dp") return;

                this.refresh();
            }
        );
    }

    componentWillUnmount() {
        deviceNotificationsReceiver.removeListener(
            this.props.deviceSerial,
            this.listnerId
        );
    }

    render() {
        let { dpPoint } = this.state;
        let { dp, deviceSerial, ...rest } = this.props;

        if (!dpPoint) return <div>Loading...</div>;

        let dpStats = dpPoint[dp];

        return (
            <MainGrid.Card
                cardTitle={<span>{dp.toUpperCase()} Load</span>}
                {...rest}
            >
                <div className="is-flex is-flex-jc-evenly">
                    {this.renderDPCores(dpStats["second"])}
                </div>
            </MainGrid.Card>
        );
    }

    private renderDPCores(dpstatsperiod: DPStatsPeriod) {
        let coreLoads = Object.entries(dpstatsperiod.cpuLoadMaximum).map(
            ([coreid, loads]) => loads[0]
        );
        let props: Partial<EasyPieChartProps> = {
            max: 100,
            lineGap: 2,
            lineWidth: 3,
            trackColor: themeVariables.mainGradientStartLight,
            size: 138,
            numTracks: 12,
        };
        let session = (dpstatsperiod.resourceUtilization["session"] || [0])[0];

        return (
            <>
                <div className="is-flex-column is-flex-center pr-2 pl-2">
                    <EasyPieChart
                        data={coreLoads.slice(0, 12)}
                        height={138}
                        width={138}
                        {...(props as any)}
                    />
                    <div>Core 0-11</div>
                </div>
                <div className="is-flex-column is-flex-center pr-2 pl-2">
                    <EasyPieChart
                        data={coreLoads.slice(12, 24)}
                        height={138}
                        width={138}
                        {...(props as any)}
                    />
                    <div>Core 12-23</div>
                </div>
                <div className="is-flex-column is-flex-center pr-2 pl-2">
                    <EasyPieChart
                        data={coreLoads.slice(24, 36)}
                        height={138}
                        width={138}
                        {...(props as any)}
                    />
                    <div>Core 24-35</div>
                </div>
                <div className="is-flex-column is-flex-center pr-2 pl-2">
                    <EasyPieChart
                        data={coreLoads.slice(36, 48)}
                        height={138}
                        width={138}
                        {...(props as any)}
                    />
                    <div>Core 36-47</div>
                </div>
                <div className="is-flex-column is-flex-center pr-2 pl-2">
                    <EasyPieChart
                        data={session}
                        text={`${session}%`}
                        height={138}
                        width={138}
                        {...(props as any)}
                        numTracks={1}
                        lineWidth={5}
                    />
                    <div>Sessions</div>
                </div>
            </>
        );
    }

    private refresh() {
        let statsdb = new StatsDB(this.props.deviceSerial);
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
