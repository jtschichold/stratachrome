import * as React from "react";
import { RouteComponentProps } from "react-router";
import { withRouter } from "react-router-dom";

import { Card } from "./card";
export { MainGridCardProps } from "./card";
import { loadingTemplate } from "./quicktemplate";

interface RProps {
    serial?: string;
}

const Header: React.FunctionComponent = (props) => {
    let { children } = props;

    return (
        <nav className="level main-grid-header grid-col-start-2 grid-col-end-4">
            {children}
        </nav>
    );
};

const InternalMainGrid: React.FunctionComponent<RouteComponentProps<RProps>> = (
    props
) => {
    let { children } = props;
    let { serial } = props.match.params;

    return (
        <div
            className={`main-grid is-grid is-grid-column-2${
                serial ? "" : "-fr"
            }`}
        >
            {children}
        </div>
    );
};

export const MainGrid = {
    Grid: withRouter(InternalMainGrid),
    Header,
    Card,
    loadingTemplate,
};
