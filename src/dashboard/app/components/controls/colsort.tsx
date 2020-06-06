import * as React from "react";

export interface ColSortProps extends React.HTMLProps<HTMLSpanElement> {
    sortKey: string;
    sortDirection: "desc" | "asc" | "none";
    onDirectionChange: (
        key: string,
        direction: ColSortProps["sortDirection"]
    ) => void;
}

export const ColSort: React.FunctionComponent<ColSortProps> = (props) => {
    let {
        sortKey,
        sortDirection,
        onDirectionChange,
        className,
        ...spanProps
    } = props;

    let handleClick = (e: React.MouseEvent) => {
        let nextDirection: ColSortProps["sortDirection"];

        nextDirection = "desc";
        if (sortDirection === "desc") nextDirection = "asc";

        onDirectionChange(sortKey, nextDirection);

        e.preventDefault();
    };

    return (
        <>
            <span className={`icon ${className || ""}`} {...spanProps}>
                <span
                    className={`fa-stack is-colsort-${sortDirection}`}
                    style={{ height: "0.7em", top: "-8px" }}
                    onClick={handleClick}
                >
                    <i className="fas fa-sort-up fa-stack-1x"></i>
                    <i className="fas fa-sort-down fa-stack-1x"></i>
                </span>
            </span>
        </>
    );
};
