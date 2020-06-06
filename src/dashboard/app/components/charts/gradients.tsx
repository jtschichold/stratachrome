import * as React from "react";

import { themeVariables } from "../../lib/theme";

const qualitativeGradients = themeVariables.qualitativePalettes.map(
    (_, idx) => `qualitative-gradient-${idx}`
);
export const qualitativeGradientsColors = qualitativeGradients.map(
    (c) => "url(#" + c + ")"
);

export class SVGGradients extends React.Component {
    render() {
        return (
            <svg style={{ visibility: "hidden", width: 0, height: 0 }}>
                <defs>{this.generateQualitativePaletteGradients()}</defs>
            </svg>
        );
    }

    generateQualitativePaletteGradients(): JSX.Element[] {
        let nsteps = 5.0;
        let step = 1.0 / nsteps;
        let stepPerc = 100 * step;

        return themeVariables.qualitativePalettes.map((scale, qpidx) => (
            <linearGradient
                id={qualitativeGradients[qpidx]}
                x1="0"
                y1="0.5"
                x2="1"
                y2="0.5"
            >
                {Array(nsteps + 1)
                    .fill(0)
                    .map((_, idx) => (
                        <stop
                            offset={`${stepPerc * idx}%`}
                            stopColor={scale(step * idx).hex()}
                        />
                    ))}
            </linearGradient>
        ));
    }
}
