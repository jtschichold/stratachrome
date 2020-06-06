import * as React from "react";

import { themeVariables } from "../../lib/theme";

export interface MainGridCardProps {
    cardTitle?: JSX.Element;
    gridCellSize?: number;
    gridStartCell?: number;
    loading?: string;
}

export const Card: React.FunctionComponent<
    MainGridCardProps & React.HTMLProps<HTMLDivElement>
> = (props) => {
    let {
        cardTitle,
        gridCellSize,
        gridStartCell,
        loading,
        children,
        ...rest
    } = props;
    const [effectDisplay, setEffectDisplay] = React.useState(true);

    const CardHeader = () => {
        if (!cardTitle) return null;

        return (
            <div className="card-header">
                <div className="card-header-title">{cardTitle}</div>
            </div>
        );
    };

    React.useEffect(() => {
        setTimeout(() => {
            setEffectDisplay(false);
        }, 300);
    }, []);

    let start = gridStartCell === 2 ? "grid-col-start-2" : "grid-col-start-3";
    let end =
        gridCellSize === 2
            ? "grid-col-end-4"
            : gridStartCell === 2
            ? "grid-col-end-3"
            : "grid-col-end-4";

    return (
        <div className={`card main-grid-card ${start} ${end}`} {...rest}>
            <CardHeader />
            <div className="card-content">
                {!loading && children}
                {loading && (
                    <div className="loading">
                        {loading === "tag" && (
                            <span className="tag is-link">Loading</span>
                        )}
                    </div>
                )}
                <svg
                    className="effect"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    style={{
                        display: effectDisplay && !loading ? "block" : "none",
                    }}
                >
                    <defs>
                        <linearGradient id="backgroundGradient">
                            <stop
                                offset="0%"
                                stop-color={themeVariables.cardGradientStart}
                            />
                            <stop
                                offset="100%"
                                stop-color={themeVariables.cardGradientEnd}
                            />
                        </linearGradient>
                        <linearGradient
                            id="alphaBlendGradient"
                            gradientTransform="rotate(90)"
                        >
                            <stop offset="0%" stop-color="black" />
                            <stop offset="30%" stop-color="black" />
                            <stop offset="60%" stop-color="white" />
                            <stop offset="100%" stop-color="white" />
                        </linearGradient>
                        <mask id="alpha-mask">
                            <rect
                                id="alpha-rect"
                                x="0"
                                y="-200"
                                width="100"
                                height="300"
                                fill="url(#alphaBlendGradient)"
                            >
                                <animate
                                    attributeName="y"
                                    values="-200;0"
                                    dur="0.4s"
                                    repeatCount="1"
                                />
                            </rect>
                        </mask>
                    </defs>
                    <rect
                        x="0"
                        y="-100"
                        width="100"
                        height="300"
                        mask="url(#alpha-mask)"
                        fill="url(#backgroundGradient)"
                    ></rect>
                </svg>
            </div>
        </div>
    );
};
