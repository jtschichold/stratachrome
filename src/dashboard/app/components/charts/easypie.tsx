// porting of Easy Pie Chart to React

import * as React from "react";

import { themeVariables } from "../../lib/theme";

export interface EasyPieChartProps {
    size: number;
    lineWidth: number;
    lineGap?: number;
    data: number | number[];
    max: number | number[];
    numTracks?: number;
    trackColor?: string;
    text?: string;
}

export class EasyPieChart extends React.Component<
    EasyPieChartProps & Partial<React.SVGProps<SVGSVGElement>>
> {
    render() {
        let {
            size,
            lineWidth,
            data,
            lineGap,
            trackColor,
            max,
            text,
            numTracks,
            ...svgprops
        } = this.props;

        let radius = (size - lineWidth) / 2;
        let dataArray = typeof data === "number" ? [data] : data;
        if (!numTracks) numTracks = dataArray.length;

        return (
            <svg {...svgprops}>
                <g
                    transform={`translate(${size / 2},${
                        size / 2
                    }) rotate(-150)`}
                >
                    {this.drawBackground(radius, dataArray.length, numTracks)}
                    {this.drawData(radius, dataArray, max)}
                    {text && this.addText(text)}
                </g>
            </svg>
        );
    }

    private drawBackground(
        radius: number,
        numCircles: number,
        numTracks: number,
        props?: Partial<React.SVGProps<SVGPathElement>>
    ): JSX.Element[] {
        let { trackColor, lineWidth, lineGap } = this.props;

        if (!trackColor) return [];

        props = props || { style: {} };
        props.style.strokeWidth = lineWidth;
        props.style.stroke = trackColor;
        props.style.fill = "none";
        props.style.strokeLinecap = "round";

        return Array(numTracks)
            .fill(0)
            .map((_, i) => {
                let cradius = radius - i * (lineGap + lineWidth);
                return (
                    <path
                        d={this.describeArc(0, 0, cradius, 0, 300)}
                        strokeOpacity={i < numCircles ? 1 : 0.5}
                        {...props}
                    />
                );
            });
    }

    private drawData(
        radius: number,
        data: number[],
        max: number | number[],
        props?: Partial<React.SVGProps<SVGPathElement>>
    ): JSX.Element[] {
        let { lineWidth, lineGap } = this.props;

        props = props || { style: {} };
        props.style.strokeWidth = lineWidth;
        props.style.fill = "none";
        props.style.strokeLinecap = "round";

        let trackLengths: number[] = data.map((d, j) => {
            if (d !== 0 && d < 10) return 1; // one bar if the load is under 10 but different than 0
            return typeof max === "number"
                ? Math.round((d * 10) / max)
                : Math.round((d * 10) / max[j]);
        });
        let result: JSX.Element[] = [];

        data.forEach((value, i) => {
            let cradius = radius - i * (lineGap + lineWidth);
            Array(300 / 30)
                .fill(0)
                .forEach((_, j) =>
                    result.push(
                        <path
                            d={this.describeArc(
                                0,
                                0,
                                cradius,
                                30 * j,
                                30 * (j + 1)
                            )}
                            stroke={
                                j < trackLengths[i]
                                    ? `url(#easy-pie-sequential-${j})`
                                    : "none"
                            }
                            {...props}
                        />
                    )
                );
        });

        return result;
    }

    private addText(text) {
        return (
            <text
                transform="rotate(150)"
                x="0"
                y="0"
                style={{ fill: themeVariables.text, fontSize: "14px" }}
                textAnchor="middle"
                alignmentBaseline="middle"
            >
                {text}
            </text>
        );
    }

    // see https://stackoverflow.com/questions/5736398/how-to-calculate-the-svg-path-for-an-arc-of-a-circle
    private polarToCartesian(
        centerX: number,
        centerY: number,
        radius: number,
        angleInDegrees: number
    ): [number, number] {
        let angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

        return [
            centerX + radius * Math.cos(angleInRadians),
            centerY + radius * Math.sin(angleInRadians),
        ];
    }

    private describeArc(
        cx: number,
        cy: number,
        radius: number,
        startAngle: number,
        endAngle: number
    ): string {
        let [sx, sy] = this.polarToCartesian(cx, cy, radius, endAngle);
        let [ex, ey] = this.polarToCartesian(cx, cy, radius, startAngle);

        let largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

        let d = [
            "M",
            sx,
            sy,
            "A",
            radius,
            radius,
            0,
            largeArcFlag,
            0,
            ex,
            ey,
        ].join(" ");

        return d;
    }
}

export class EasyPieSVGGradients extends React.Component {
    render() {
        return (
            <svg style={{ visibility: "hidden", width: 0, height: 0 }}>
                <defs>{this.generateSVGGradients()}</defs>
            </svg>
        );
    }

    private generateSVGGradients(): JSX.Element[] {
        return Array(10)
            .fill(0)
            .map((_, idx) => (
                <linearGradient
                    id={`easy-pie-sequential-${idx}`}
                    {...this.generateRotatedVector(idx)}
                >
                    <stop
                        offset="0%"
                        stopColor={themeVariables
                            .sequentialPalette(idx / 10.0)
                            .hex()}
                    />
                    <stop
                        offset="100%"
                        stopColor={themeVariables
                            .sequentialPalette((idx + 1) / 10.0)
                            .hex()}
                    />
                </linearGradient>
            ));
    }

    private generateRotatedVector(
        ridx: number
    ): Partial<React.SVGProps<SVGLinearGradientElement>> {
        let angle = +(18 + 36 * ridx);
        // if (angle > 180) angle = -angle;

        let cosa = Math.cos((angle / 360.0) * Math.PI);
        let sina = Math.sin((angle / 360.0) * Math.PI);
        let x1 = 0;
        let y1 = 0;

        let x2 = -sina;
        let y2 = cosa;
        if (angle <= 90) {
            x2 = cosa;
            y2 = sina;
        }

        if (x2 < 0) {
            x1 -= x2;
            x2 = 0;
        }
        if (y2 < 0) {
            y1 -= y2;
            y2 = 0;
        }

        return { x1, y1, x2, y2 };
    }
}
