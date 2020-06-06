import * as React from "react";
import { HeatMapCanvas } from "@nivo/heatmap";
import lowerCase from "lodash/lowerCase";
import moment from "moment";

import {
    Device,
    DPPoint,
    DPStatsPeriodSpec,
    DPStats,
    DPStatsEntry,
} from "../../../../../common/models";
import { StatsDB } from "../../../../../common/lib/statsdb";
import { nivoTheme, themeVariables } from "../../../lib/theme";
import { deviceNotificationsReceiver } from "../../../lib/devicenotifications";
import {
    DropdownFilter,
    DropdownFilterProps,
    DropdownSelect,
    DropdownSelectProps,
} from "../../controls";
import { MainGrid } from "../../maingrid";

interface Props {
    device: Device;
}

interface State {
    dpPointTimestamp: number | null;
    dpPoint: DPPoint | null;
    period: DPStatsPeriodSpec;
    updateAvailable: boolean;
    filter: DropdownFilterProps["value"];
}

export class DataPlaneDetails extends React.Component<Props, State> {
    private listnerId: number = null;
    private periodOptions: DropdownSelectProps["options"] = [
        { value: "second", name: "Last Minute" },
        { value: "minute", name: "Last Hour" },
        { value: "hour", name: "Last 24 Hours" },
        { value: "day", name: "Last 7 Days" },
        { value: "week", name: "Last 3 Months" },
    ];

    state: State = {
        dpPointTimestamp: null,
        dpPoint: null,
        period: "minute",
        updateAvailable: false,
        filter: [],
    };

    componentDidMount() {
        this.refresh();

        this.listnerId = deviceNotificationsReceiver.addListener(
            this.props.device.serial,
            (utype) => {
                if (utype !== "dp") return;

                this.setState({
                    ...this.state,
                    updateAvailable: true,
                });
            }
        );
    }

    componentWillUnmount() {
        deviceNotificationsReceiver.removeListener(
            this.props.device.serial,
            this.listnerId
        );
        this.listnerId = null;
    }

    shouldComponentUpdate(
        nextProps: Readonly<Props>,
        nextState: Readonly<State>
    ) {
        if (nextProps.device.serial !== this.props.device.serial) return true;

        let result = false;
        Object.entries(nextState).forEach(([key, value]) => {
            result = result || (value as any) !== this.state[key];
        });

        return result;
    }

    render() {
        let { dpPoint, period, updateAvailable, filter } = this.state;

        if (!dpPoint)
            return (
                <>
                    <MainGrid.Header>
                        <div className="level-left"></div>
                        <div className="level-right">
                            <div className="level-item">
                                <DropdownFilter
                                    isRight
                                    value={[]}
                                    onChange={this.onFilterChange}
                                    options={[]}
                                />
                            </div>
                        </div>
                    </MainGrid.Header>
                    {MainGrid.loadingTemplate([2, 2], false)}
                </>
            );

        let dps = Object.keys(dpPoint)
            .filter((dp) => dp !== "serial" && dp !== "date")
            .sort();

        let filterOptions: DropdownFilterProps["options"] = [];
        if (dps.length > 1) {
            filterOptions = dps.map((dp) => ({
                name: dp.toUpperCase(),
                group: "Data Processor",
                value: dp.toLowerCase(),
            }));
        }
        filterOptions.push(
            ...[
                {
                    name: "Load Maximum",
                    group: "Metric",
                    value: "load maximum",
                },
                {
                    name: "Load Average",
                    group: "Metric",
                    value: "load average",
                },
                {
                    name: "Resource Utilization",
                    group: "Metric",
                    value: "resource utilization",
                },
                { name: "Tasks", group: "Metric", value: "tasks" },
            ]
        );

        return (
            <>
                <MainGrid.Header>
                    <div className="level-left">
                        <div className="level-item">
                            <p className="subtitle is-6">
                                Updated{" "}
                                <strong>
                                    <RelativeMoment
                                        date={(dpPoint as any).date}
                                    />
                                </strong>
                            </p>
                        </div>
                        {updateAvailable && (
                            <div className="level-item">
                                <button
                                    className="button"
                                    onClick={this.refresh}
                                >
                                    Refresh
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="level-right">
                        <div className="level-item">
                            <DropdownFilter
                                isRight
                                value={filter}
                                onChange={this.onFilterChange}
                                options={filterOptions}
                            />
                        </div>
                        <div className="level-item">
                            <DropdownSelect
                                value={period}
                                isRight
                                icon="fa-clock"
                                options={this.periodOptions}
                                onChange={this.onSelectTimeChange}
                            />
                        </div>
                    </div>
                </MainGrid.Header>
                {dps.map((dp) => {
                    let dpstats = dpPoint[dp];
                    let dpl = dp.toLowerCase();

                    return (
                        <>
                            <MainGrid.Card
                                style={{
                                    display: this.isFiltered(
                                        filter,
                                        dpl,
                                        "load maximum"
                                    ),
                                }}
                                cardTitle={
                                    <span>{`${dp.toUpperCase()} Load Maximum`}</span>
                                }
                                gridCellSize={2}
                                gridStartCell={2}
                            >
                                {this.renderCoreHeathmap(
                                    dpstats,
                                    period,
                                    "cpuLoadMaximum"
                                )}
                            </MainGrid.Card>
                            <MainGrid.Card
                                gridStartCell={2}
                                gridCellSize={2}
                                style={{
                                    display: this.isFiltered(
                                        filter,
                                        dpl,
                                        "load average"
                                    ),
                                }}
                                cardTitle={
                                    <span>{`${dp.toUpperCase()} Load Average`}</span>
                                }
                            >
                                {this.renderCoreHeathmap(
                                    dpstats,
                                    period,
                                    "cpuLoadAverage"
                                )}
                            </MainGrid.Card>
                            <MainGrid.Card
                                gridCellSize={2}
                                gridStartCell={2}
                                style={{
                                    display: this.isFiltered(
                                        filter,
                                        dpl,
                                        "resource utilization"
                                    ),
                                }}
                                cardTitle={
                                    <span>{`${dp.toUpperCase()} Resource Utilization`}</span>
                                }
                            >
                                {this.renderResourceUtilizationHeatmap(
                                    dpstats,
                                    period,
                                    "resourceUtilization"
                                )}
                            </MainGrid.Card>
                            {period === "second" && (
                                <MainGrid.Card
                                    gridStartCell={2}
                                    gridCellSize={2}
                                    style={{
                                        display: this.isFiltered(
                                            filter,
                                            dpl,
                                            "tasks"
                                        ),
                                    }}
                                    cardTitle={
                                        <span>{`${dp.toUpperCase()} Tasks`}</span>
                                    }
                                >
                                    {this.renderTaskTable(dpstats, period)}
                                </MainGrid.Card>
                            )}
                        </>
                    );
                })}
            </>
        );
    }

    private renderTaskTable(dpstats: DPStats, period: DPStatsPeriodSpec) {
        return (
            <div className="is-flex-column" style={{ width: "950px" }}>
                {Object.entries(dpstats[period].task)
                    .filter(
                        ([taskid, stats]) =>
                            taskid !== "serial" && taskid !== "date"
                    )
                    .map(([taskid, stats]) => (
                        <div className="is-flex-center">
                            <div
                                className="is-size-7 is-not-flex-shrink"
                                style={{ width: "190px", textAlign: "right" }}
                            >
                                {lowerCase(taskid)}
                            </div>
                            <div className="ml-4 is-flex-grow">
                                <progress
                                    className="progress"
                                    value={stats[0]}
                                    max={100}
                                >
                                    {"" + stats[0] + "%"}
                                </progress>
                            </div>
                        </div>
                    ))}
            </div>
        );
    }

    private renderCoreHeathmap(
        dpstats: DPStats,
        period: DPStatsPeriodSpec,
        attribute: string
    ) {
        let entry: DPStatsEntry = dpstats[period][attribute];

        return this.renderDPStatsHeathmap(entry, {
            margin: { top: 0, right: 0, bottom: 0, left: 60 },
            axisLeft: {
                orient: "left",
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: "core",
                legendPosition: "middle",
                legendOffset: -40,
            },
            tooltip: this.tooltipCore,
        });
    }

    private renderResourceUtilizationHeatmap(
        dpstats: DPStats,
        period: DPStatsPeriodSpec,
        attribute: string
    ) {
        let entry: DPStatsEntry = dpstats[period][attribute];

        return this.renderDPStatsHeathmap(entry, {
            margin: { top: 0, right: 0, bottom: 0, left: 200 },
            axisLeft: {
                orient: "left",
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: "",
                legendPosition: "middle",
                legendOffset: -40,
            },
            tooltip: this.tooltipRU,
        });
    }

    // XXX Props should be Partial of something
    private renderDPStatsHeathmap(entry: DPStatsEntry, props: any) {
        let coreStats = Object.entries(entry);

        let keys: string[] = [];
        let data: any[] = coreStats.map(([core, load]) => {
            let result: any = {
                core: lowerCase(core),
            };

            let i: number = 0;
            for (let coreload of load) {
                let key = "load" + i;
                if (keys.length <= i) keys.push(key);
                result["load" + i] = coreload;
                i += 1;
            }

            return result;
        });

        let hmprops = {
            indexBy: "core",
            maxValue: 100,
            minValue: 0,
            data,
            keys,
            height: coreStats.length * 13,
            width: 890 + 60,
            colors: [
                themeVariables.sequentialPalette(0),
                themeVariables.sequentialPalette(0.2),
                themeVariables.sequentialPalette(0.4),
                themeVariables.sequentialPalette(0.6),
                themeVariables.sequentialPalette(0.8),
                themeVariables.sequentialPalette(1.0),
            ],
            enableLabels: false,
            enableGridX: false,
            enableGridY: false,
            padding: 3,
            axisBottom: null,
            axisTop: null,
            axisRight: null,
            cellOpacity: 1,
            theme: nivoTheme,
            ...props,
        };

        return <HeatMapCanvas {...hmprops} />;
    }

    private tooltipCore({ yKey, value }) {
        return `Core${yKey} ${value}%`;
    }

    private tooltipRU({ yKey, value }) {
        return `${yKey} ${value}%`;
    }

    private refresh = () => {
        let statsdb = new StatsDB(this.props.device.serial);
        statsdb.open().then(() => {
            statsdb.getLastElements("dp", 1).then((result) => {
                if (result.length !== 1) return;

                this.setState({
                    ...this.state,
                    dpPointTimestamp: result[0].date,
                    dpPoint: result[0] as any,
                    updateAvailable: false,
                });
            });
        });
    };

    private isFiltered(
        filter: State["filter"],
        dp: string,
        metric: string
    ): "none" | "block" {
        if (filter.length === 0) return "block";

        if (filter.findIndex((f) => f.group === "Data Processor") !== -1) {
            if (
                filter.findIndex(
                    (f) => f.group === "Data Processor" && f.value === dp
                ) === -1
            ) {
                return "none";
            }
        }

        if (filter.findIndex((f) => f.group === "Metric") !== -1) {
            if (
                filter.findIndex(
                    (f) => f.group === "Metric" && f.value === metric
                ) === -1
            ) {
                return "none";
            }
        }

        return "block";
    }

    private onSelectTimeChange = (period: DPStatsPeriodSpec) => {
        this.setState({
            ...this.state,
            period,
        });
    };

    private onFilterChange: DropdownFilterProps["onChange"] = (newFilter) => {
        this.setState({
            ...this.state,
            filter: newFilter,
        });
    };
}

interface RelativeMomentProps {
    date: number;
}

interface RelativeMomentState {
    fromNow: string;
}

export class RelativeMoment extends React.Component<
    RelativeMomentProps,
    RelativeMomentState
> {
    private interval;
    state = {
        fromNow: "N/A",
    };

    render() {
        return moment(this.props.date).fromNow();
    }

    componentDidMount() {
        this.update();
        this.interval = setInterval(() => this.update(), 10000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    private update() {
        this.setState({
            ...this.state,
            fromNow: moment(this.props.date).fromNow(),
        });
    }
}
