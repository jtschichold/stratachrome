import { Theme as NivoTheme } from "@nivo/core";
import { Scale } from "chroma-js";
import * as chroma from "chroma-js";

import scssVariables from "../styles/exports.scss";

interface ThemeVariables {
    cardGradientStart: string;
    cardGradientEnd: string;
    mainGradientStart: string;
    mainGradientStartLight: string;
    mainGradientEnd: string;
    sequentialPalette: Scale;
    qualitativePalettes: Scale[];
    text: string;
    fontFamily: string;
}

export const themeVariables: ThemeVariables = {
    ...scssVariables,
    sequentialPalette: chroma
        .scale(scssVariables.sequentialPalette.split(","))
        .mode("lch"),
    qualitativePalettes: [
        chroma.scale(scssVariables.qualitativePalette1.split(",")).mode("lch"),
        chroma.scale(scssVariables.qualitativePalette2.split(",")).mode("lch"),
        chroma.scale(scssVariables.qualitativePalette3.split(",")).mode("lch"),
    ],
};

interface CrosshairTheme {
    crosshair?: {
        line?: Partial<React.CSSProperties>;
    };
}

export const nivoTheme: NivoTheme & CrosshairTheme = {
    axis: {
        ticks: {
            text: {
                fill: themeVariables.text,
                fontFamily: themeVariables.fontFamily,
            },
            line: {
                stroke: themeVariables.text,
                strokeOpacity: 0.5,
            },
        },
        legend: {
            text: {
                fill: themeVariables.text,
            },
        },
    },
    tooltip: {
        container: {
            backgroundColor: themeVariables.mainGradientEnd,
            padding: "0 0.75em",
            borderRadius: "1px",
            opacity: 0.8,
        },
    },
    grid: {
        line: {
            stroke: themeVariables.mainGradientEnd,
        },
    },
    crosshair: {
        line: {
            stroke: themeVariables.text,
            strokeOpacity: 0.5,
        },
    },
};
