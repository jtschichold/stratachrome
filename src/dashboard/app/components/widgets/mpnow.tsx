import * as React from "react";

import { MPPoint } from "../../../../common/models";
import { StatsDB } from "../../../../common/lib/statsdb";
import { themeVariables } from "../../lib/theme";
import { deviceNotificationsReceiver } from "../../lib/devicenotifications";
import { EasyPieChart, EasyPieChartProps } from "../charts";

import { MainGrid, MainGridCardProps } from "../maingrid";

interface Props {
    deviceSerial: string;
}

interface State {
    mpPoint: MPPoint | null;
}

export class MPNow extends React.Component<Props & MainGridCardProps, State> {
    private listnerId: number = null;

    state: State = {
        mpPoint: null,
    };

    componentDidMount() {
        this.refresh();

        this.listnerId = deviceNotificationsReceiver.addListener(
            this.props.deviceSerial,
            (utype) => {
                if (utype !== "mp") return;

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
        let { mpPoint } = this.state;
        let { deviceSerial, ...rest } = this.props;

        if (!mpPoint) return <div>Loading...</div>;

        let props: Partial<EasyPieChartProps> = {
            max: 100,
            lineGap: 2,
            lineWidth: 8,
            trackColor: themeVariables.mainGradientStartLight,
            size: 138,
            numTracks: 1,
        };
        let memoryPerc =
            (mpPoint.memoryUsed * 100.0) /
            (mpPoint.memoryUsed + mpPoint.memoryFree);
        let swapPerc =
            (mpPoint.swapUsed * 100.0) / (mpPoint.swapUsed + mpPoint.swapFree);

        return (
            <MainGrid.Card
                cardTitle={<span>Management Plane Load</span>}
                {...rest}
            >
                <div className="is-flex pb-2 is-flex-jc-evenly">
                    <div className="is-flex-column is-flex-center pr-2 pl-2">
                        <EasyPieChart
                            data={memoryPerc}
                            text={`${memoryPerc.toFixed(1)}%`}
                            height={138}
                            width={138}
                            {...(props as any)}
                            numTracks={1}
                        />
                        <div>Memory</div>
                    </div>
                    <div className="is-flex-column is-flex-center pr-2 pl-2">
                        <EasyPieChart
                            data={swapPerc}
                            text={
                                isNaN(swapPerc)
                                    ? "--"
                                    : swapPerc.toFixed(1) + "%"
                            }
                            height={138}
                            width={138}
                            {...(props as any)}
                            numTracks={1}
                        />
                        <div>Swap</div>
                    </div>
                    <div className="is-flex-column is-flex-center pr-2 pl-2">
                        <EasyPieChart
                            data={mpPoint.us}
                            text={`${mpPoint.us}%`}
                            height={138}
                            width={138}
                            {...(props as any)}
                            numTracks={1}
                        />
                        <div>CPU User</div>
                    </div>
                    <div className="is-flex-column is-flex-center pr-2 pl-2">
                        <EasyPieChart
                            data={mpPoint.sy}
                            text={`${mpPoint.sy}%`}
                            height={138}
                            width={138}
                            {...(props as any)}
                            numTracks={1}
                        />
                        <div>CPU System</div>
                    </div>
                    <div className="is-flex-column is-flex-center pr-2 pl-2">
                        <EasyPieChart
                            data={[
                                mpPoint.ni,
                                mpPoint.wa,
                                mpPoint.hi,
                                mpPoint.si,
                                mpPoint.st,
                            ]}
                            text={`${(
                                mpPoint.ni +
                                mpPoint.wa +
                                mpPoint.hi +
                                mpPoint.si +
                                mpPoint.st
                            ).toFixed(1)}%`}
                            height={138}
                            width={138}
                            {...(props as any)}
                            numTracks={5}
                            lineWidth={5}
                        />
                        <div>CPU ni/wa/hi/si/st</div>
                    </div>
                </div>
            </MainGrid.Card>
        );
    }

    private refresh() {
        let statsdb = new StatsDB(this.props.deviceSerial);
        statsdb.open().then(() => {
            statsdb.getLastElements("mp", 1).then((result) => {
                if (result.length !== 1) return;

                this.setState({
                    ...this.state,
                    mpPoint: result[0] as any,
                });
            });
        });
    }
}
