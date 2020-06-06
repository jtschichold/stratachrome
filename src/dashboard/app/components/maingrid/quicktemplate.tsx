import * as React from "react";
import { Card } from "./card";

export const loadingTemplate = (
    template: number[],
    withTag: boolean
): JSX.Element => {
    let lineStart: boolean = true;

    return (
        <>
            {template.map((size) => {
                if (size === 2) {
                    lineStart = true;
                    return (
                        <Card
                            loading={withTag && "tag"}
                            gridCellSize={size}
                            gridStartCell={2}
                        />
                    );
                }

                if (lineStart) {
                    lineStart = false;
                    return (
                        <Card
                            loading={withTag && "tag"}
                            gridCellSize={1}
                            gridStartCell={2}
                        >
                            <div style={{ height: "150px" }} />
                        </Card>
                    );
                }

                lineStart = true;
                return (
                    <Card
                        loading={withTag && "tag"}
                        gridCellSize={1}
                        gridStartCell={3}
                    >
                        <div style={{ height: "150px" }} />
                    </Card>
                );
            })}
        </>
    );
};
