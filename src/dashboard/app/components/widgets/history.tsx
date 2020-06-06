import * as React from "react";
import { Line, Serie, LineSvgProps, Datum } from "@nivo/line";

import { MetricListManager, MetricPoint } from "../../lib/metrichandlers";
import { nivoTheme } from "../../lib/theme";
import { qualitativeGradientsColors } from "../charts";
import { MainGrid, MainGridCardProps } from "../maingrid";
import { isNaN } from "formik";

interface HistorySerie {
    xMin: number | bigint;
    xMax: number | bigint;
    yMax: number | bigint;
    yMin: number | bigint;
    unit: string;
    serie: Serie;
}

interface Props {
    metricListManager: MetricListManager;
    metric: string;
    title: string;
    colorKey?: number;
    modifier?: (n: number | bigint) => number | bigint;
    legend?: string;
    targetUnit?: string;
    gridCellSize?: number;
    binInterval?: number;
}

interface State {
    error: string;
    last60Minutes: MetricPoint[];
    series: HistorySerie[];
    scalingFactor: number; // power of 10
}

const scalingFactorSuffix = ["", "K", "M", "G", "T", "P", "E", "Z", "Y"];

function rotateArray<T>(a: T[], rotations: number): T[] {
    let r = [...a];

    while (rotations > 0) {
        r.unshift(r.pop());
        rotations -= 1;
    }

    return r;
}

const unitToUnitModifiers: Map<
    string,
    (v: number | bigint) => number | bigint
> = new Map([["Bps:bps", (v) => (typeof v === "bigint" ? v * 8n : v * 8)]]);

interface HistoryLineSvgProps extends LineSvgProps {
    areaBaselineValue: number;
}

export class HistoryChart extends React.Component<
    Props & MainGridCardProps,
    State
> {
    private metricUnsubscribe: () => void;

    state: State = {
        error: null,
        last60Minutes: [],
        series: [],
        scalingFactor: 0,
    };

    componentDidMount() {
        let m = this.props.metricListManager.metrics.find(
            (m) => m.name === this.props.metric
        );
        if (typeof m === "undefined") {
            this.setState({
                ...this.state,
                error: `Unknown metric ${this.props.metric}`,
            });

            return;
        }

        this.refresh().finally(() => {
            this.metricUnsubscribe = m.handler.subscribe(
                this.props.metric,
                () => {
                    this.refresh();
                }
            );
        });
    }

    componentWillUnmount() {
        if (this.metricUnsubscribe) this.metricUnsubscribe();
        this.metricUnsubscribe = null;
    }

    render() {
        let {
            title,
            colorKey,
            legend,
            targetUnit,
            modifier,
            metricListManager,
            metric,
            gridCellSize,
            binInterval,
            ...rest
        } = this.props;
        let { series, error } = this.state;

        gridCellSize = gridCellSize || 1;
        colorKey = colorKey || 0;
        let colors = rotateArray(qualitativeGradientsColors, colorKey);
        let width = gridCellSize === 1 ? 450 : 950;

        return (
            <MainGrid.Card
                cardTitle={
                    <>
                        <span>{title}</span>
                        {series &&
                            series.length !== 0 &&
                            series[0].unit !== "tick" && (
                                <span className="pl-1">
                                    (
                                    {series[0].unit === "pp"
                                        ? "%"
                                        : series[0].unit}
                                    )
                                </span>
                            )}
                    </>
                }
                gridCellSize={gridCellSize}
                {...rest}
            >
                {(!series ||
                    series.length === 0 ||
                    series[0].serie.data.length === 0) && (
                    <div
                        style={{
                            width: "" + width + "px",
                            height: "125px",
                        }}
                        className={error ? "notification is-danger" : ""}
                    >
                        {error ? error : "Loading..."}
                    </div>
                )}
                {series &&
                    series.length > 0 &&
                    series[0].serie.data.length > 0 &&
                    this.renderMetricChart(series[0], width, colors, {
                        targetUnit,
                        legend,
                    })}
            </MainGrid.Card>
        );
    }

    private renderMetricChart(
        serie: HistorySerie,
        width: number,
        colors: string[],
        options: Partial<Props>
    ) {
        let { legend, targetUnit } = options;
        let marginLeft = legend ? 75 : 60;
        let suffix = scalingFactorSuffix[this.state.scalingFactor];

        if (isNaN(serie.yMax)) {
            return (
                <div
                    style={{
                        width: "" + width + "px",
                        height: "125px",
                        justifyContent: "center",
                    }}
                    className="is-flex-center"
                >
                    <i>No Data</i>
                </div>
            );
        }

        let lineprops: HistoryLineSvgProps = {
            data: [serie.serie],
            enableArea: true,
            areaBaselineValue: serie.yMin as number,
            areaOpacity: 1,
            lineWidth: 0,
            margin: { top: 10, right: 0, bottom: 25, left: marginLeft },
            xScale: { type: "time", format: "native", precision: "second" },
            yScale: {
                type: "linear",
                max: serie.yMax as number,
                min: serie.yMin as number,
            },
            axisBottom: {
                format: "%H:%M",
                tickValues: "every 15 minutes",
                legend: "",
                legendPosition: "middle",
                legendOffset: 46,
            },
            axisLeft: {
                legend,
                legendPosition: "middle",
                legendOffset: -60,
                tickValues: 5,
                format: (d) => {
                    if (d === 0) return "" + d;

                    return "" + d + suffix;
                },
            },
            enablePoints: false,
            enableGridX: false,
            enableGridY: true,
            curve: "step",
            animate: false,
            motionStiffness: 120,
            motionDamping: 50,
            isInteractive: true,
            enableSlices: "x",
            enableCrosshair: true,
            crosshairType: "x",
            sliceTooltip: (d) => (
                <div style={{ ...nivoTheme.tooltip.container }}>
                    {"" +
                        d.slice.points[0].data.y +
                        suffix +
                        (serie.unit === "tick" ? "" : serie.unit)}
                </div>
            ),
            useMesh: false,
            colors,
            theme: nivoTheme,
        };

        return <Line height={125} width={width} {...lineprops} />;
    }

    private refresh(): Promise<any> {
        let {
            metricListManager,
            metric,
            binInterval,
            modifier,
            targetUnit,
        } = this.props;
        let m = metricListManager.metrics.find((m) => m.name === metric);
        if (typeof m === "undefined") {
            this.setState({
                ...this.state,
                error: "Unknown metric",
            });

            return Promise.reject("Unknown metric");
        }

        let { handler, max, min, unit } = m;
        if (typeof max === "undefined") {
            max = "auto";
        }
        if (typeof min === "undefined") {
            min = 0;
        }

        return handler
            .getLast60Minutes(metric)
            .then((entries: MetricPoint[]) => {
                modifier =
                    modifier ||
                    unitToUnitModifiers.get(`${unit}:${targetUnit}`) ||
                    ((n) => n);

                let newSerie: HistorySerie = {
                    yMin: null,
                    yMax: null,
                    xMin: null,
                    xMax: null,
                    serie: { id: "serie", data: [] },
                    unit: targetUnit || unit,
                };

                for (let { t, v } of entries) {
                    v = modifier(v);

                    if (newSerie.yMin === null || v < newSerie.yMin)
                        newSerie.yMin = v;
                    if (newSerie.yMax === null || v > newSerie.yMax)
                        newSerie.yMax = v;
                    if (newSerie.xMin === null || t < newSerie.xMin)
                        newSerie.xMin = t;
                    if (newSerie.xMax === null || t > newSerie.xMax)
                        newSerie.xMax = t;
                }

                if (max !== "auto") {
                    newSerie.yMax = max;
                }

                if (binInterval) {
                    let tempBins = new Map<number, MetricPoint>();

                    entries.forEach((mp) => {
                        let bin =
                            Math.floor(mp.t / (binInterval * 1000)) *
                            (binInterval * 1000);
                        if (tempBins.has(bin)) {
                            let e = tempBins.get(bin);
                            if (mp.v > e.v) {
                                e.v = mp.v;
                            }
                        } else {
                            tempBins.set(bin, { t: bin, v: mp.v });
                        }
                    });

                    entries = [...tempBins.values()];

                    tempBins.clear(); // avoid storing memory in the binding
                }

                let data: Serie["data"] = [];
                let scalingFactor: number = 0;
                let yMax: number = 0;
                let yMin: number = 0;

                if (typeof newSerie.yMax === "bigint") {
                    let scaling = 1n;
                    let scalingMultiplier =
                        newSerie.unit === "bps" ? 1024n : 1000n;

                    while (newSerie.yMax / scaling >= scalingMultiplier) {
                        scaling = scaling * scalingMultiplier;
                        scalingFactor += 1;
                    }

                    data = entries.map(({ v, t }) => {
                        let m = modifier(v) as bigint;

                        let n = Number((m * 10n) / scaling);
                        n = n / 10.0;

                        return { y: n, x: new Date(t) };
                    });

                    yMax = Number(newSerie.yMax / scaling);
                    yMin = Number((newSerie.yMin as bigint) / scaling);
                } else {
                    let scaling = 1;
                    let scalingMultiplier =
                        newSerie.unit === "bps" ? 1024 : 1000;

                    while (newSerie.yMax / scaling >= scalingMultiplier) {
                        scaling = scaling * scalingMultiplier;
                        scalingFactor += 1;
                    }

                    data = entries.map(({ v, t }) => {
                        return {
                            x: new Date(t),
                            y: (modifier(v) as number) / scaling,
                        };
                    });

                    yMax = Number(newSerie.yMax / scaling);
                    yMin = Number((newSerie.yMin as number) / scaling);
                }

                let realDelta = yMax - yMin;
                let chartYMax =
                    max === "auto"
                        ? realDelta === 0
                            ? Math.ceil(yMax * 1.1)
                            : Math.ceil(yMax + realDelta / 10.0)
                        : Number(max);
                let chartYMin =
                    min === "auto"
                        ? realDelta === 0
                            ? Math.floor(yMin * 0.9)
                            : Math.max(0, yMin - realDelta / 10.0)
                        : Number(min);

                if (max === "auto" && chartYMax === 0 && chartYMin === 0) {
                    chartYMax = 10; // XXX
                }

                newSerie.yMin = chartYMin;
                newSerie.yMax = chartYMax;

                newSerie.serie.data = this.fillGaps(newSerie.yMin, data);

                this.setState({
                    ...this.state,
                    series: [newSerie],
                    scalingFactor,
                });
            });
    }

    private fillGaps = (yMin: number, data: Datum[]): Datum[] => {
        let now = new Date().getTime();
        let lastTime = now - 3600000;
        let result: Datum[] = [];

        data.forEach((d) => {
            let currentTime = (d.x as Date).getTime();
            let delta = currentTime - lastTime;
            if (delta <= 65000) {
                result.push(d);
                lastTime = currentTime;
                return;
            }

            while (lastTime + 65000 < currentTime) {
                result.push({
                    x: new Date(lastTime + 60000),
                    y: yMin,
                });
                lastTime += 60000;
            }
        });

        while (lastTime + 65000 < now) {
            result.push({
                x: new Date(lastTime + 60000),
                y: yMin,
            });
            lastTime += 60000;
        }

        return result;
    };
}
