import * as React from "react";
import orderBy from "lodash/orderBy";

import {
    Device,
    MetricPoint,
    DeepDiveTemplateParameter,
} from "../../../../../common/models";
import { deviceNotificationsReceiver } from "../../../lib/devicenotifications";
import { StatsDB, StatsDBValue } from "../../../../../common/lib/statsdb";
import {
    DropdownFilter,
    DropdownFilterProps,
    ColSort,
    ColSortProps,
} from "../../controls";
import { MainGrid } from "../../maingrid";

interface Counter {
    name: string;
    category: string;
    aspect: string;
    severity: string;
    value?: bigint;
    rate?: bigint;
}

interface Props {
    device: Device;
    activateDDL: (param: DeepDiveTemplateParameter) => void;
}

interface State {
    countersPoint: MetricPoint | null;
    filterOptions: DropdownFilterProps["options"];
    filter: DropdownFilterProps["value"];
    sortKey: string;
    sortDirection: ColSortProps["sortDirection"];
}

export class CounterGlobal extends React.Component<Props, State> {
    private listnerId: number = null;

    state: State = {
        countersPoint: null,
        filterOptions: [],
        filter: [],
        sortKey: null,
        sortDirection: "none",
    };

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.refresh();

        this.listnerId = deviceNotificationsReceiver.addListener(
            this.props.device.serial,
            (utype) => {
                if (utype !== "counters") return;

                this.refresh();
            }
        );
    }

    componentWillUnmount() {
        deviceNotificationsReceiver.removeListener(
            this.props.device.serial,
            this.listnerId
        );
    }

    shouldComponentUpdate(nextProps: Props, nextState: State) {
        if (this.props.device.serial !== nextProps.device.serial) return true;
        if (this.state.countersPoint !== nextState.countersPoint) return true;
        if (this.state.filterOptions !== nextState.filterOptions) return true;
        if (this.state.filter !== nextState.filter) return true;
        if (this.state.sortDirection !== nextState.sortDirection) return true;
        if (this.state.sortKey !== nextState.sortKey) return true;

        return false;
    }

    render() {
        let {
            countersPoint,
            filter,
            filterOptions,
            sortKey,
            sortDirection,
        } = this.state;

        if (!countersPoint)
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
                    {MainGrid.loadingTemplate([2], false)}
                </>
            );

        let selectedAspects = filter
            .filter((f) => f.group === "Aspect")
            .map((o) => o.value);
        let selectedCategories = filter
            .filter((f) => f.group === "Category")
            .map((o) => o.value);
        let selectedSeverities = filter
            .filter((f) => f.group === "Severity")
            .map((o) => o.value);

        let counters: { [name: string]: Counter } = {};
        Object.entries(countersPoint.metrics).forEach(([m, v]) => {
            let [category, aspect, severity, name, datum] = m.split(":");

            if (
                selectedAspects.length !== 0 &&
                selectedAspects.indexOf(aspect) === -1
            )
                return;
            if (
                selectedCategories.length !== 0 &&
                selectedCategories.indexOf(category) === -1
            )
                return;
            if (
                selectedSeverities.length !== 0 &&
                selectedSeverities.indexOf(severity) === -1
            )
                return;

            if (!counters[name]) {
                counters[name] = { category, aspect, severity, name };
            }
            counters[name][datum] = v;
        });

        let countersValues = Object.values(counters);
        if ((sortKey && sortDirection === "asc") || sortDirection === "desc") {
            countersValues = orderBy(
                countersValues,
                [sortKey],
                [sortDirection]
            );
        }

        return (
            <>
                <MainGrid.Header>
                    <div className="level-left"></div>
                    <div className="level-right">
                        <div className="level-item">
                            <DropdownFilter
                                isRight
                                value={filter}
                                onChange={this.onFilterChange}
                                options={filterOptions}
                            />
                        </div>
                    </div>
                </MainGrid.Header>
                {this.renderCounters(countersValues)}
            </>
        );
    }

    private renderCounters(counters: Counter[]): JSX.Element {
        let { sortKey, sortDirection } = this.state;

        return (
            <>
                <MainGrid.Card
                    cardTitle={<span>Counter Global</span>}
                    gridCellSize={2}
                    gridStartCell={2}
                >
                    <table className="table is-fullwidth is-hoverable is-narrow">
                        <thead>
                            <tr>
                                <th style={{ width: "150px" }}>
                                    <span>Name</span>
                                    <ColSort
                                        className="is-small is-cursor-pointer ml-1"
                                        sortKey="name"
                                        sortDirection={
                                            sortKey === "name"
                                                ? sortDirection
                                                : "none"
                                        }
                                        onDirectionChange={this.onSortKeyChange}
                                    />
                                </th>
                                <th style={{ width: "150px" }}>
                                    <span>Category</span>
                                    <ColSort
                                        className="is-small is-cursor-pointer ml-1"
                                        sortKey="category"
                                        sortDirection={
                                            sortKey === "category"
                                                ? sortDirection
                                                : "none"
                                        }
                                        onDirectionChange={this.onSortKeyChange}
                                    />
                                </th>
                                <th style={{ width: "150px" }}>
                                    <span>Aspect</span>
                                    <ColSort
                                        className="is-small is-cursor-pointer ml-1"
                                        sortKey="aspect"
                                        sortDirection={
                                            sortKey === "aspect"
                                                ? sortDirection
                                                : "none"
                                        }
                                        onDirectionChange={this.onSortKeyChange}
                                    />
                                </th>
                                <th style={{ width: "100px" }}>
                                    <span>Severity</span>
                                    <ColSort
                                        className="is-small is-cursor-pointer ml-1"
                                        sortKey="severity"
                                        sortDirection={
                                            sortKey === "severity"
                                                ? sortDirection
                                                : "none"
                                        }
                                        onDirectionChange={this.onSortKeyChange}
                                    />
                                </th>
                                <th style={{ width: "150px" }}>
                                    <span>Value</span>
                                    <ColSort
                                        className="is-small is-cursor-pointer ml-1"
                                        sortKey="value"
                                        sortDirection={
                                            sortKey === "value"
                                                ? sortDirection
                                                : "none"
                                        }
                                        onDirectionChange={this.onSortKeyChange}
                                    />
                                </th>
                                <th style={{ width: "150px" }}>
                                    <span>Rate</span>
                                    <ColSort
                                        className="is-small is-cursor-pointer ml-1"
                                        sortKey="rate"
                                        sortDirection={
                                            sortKey === "rate"
                                                ? sortDirection
                                                : "none"
                                        }
                                        onDirectionChange={this.onSortKeyChange}
                                    />
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {counters.map((c) => (
                                <tr>
                                    <td>
                                        <CounterName
                                            name={c.name}
                                            type="Counter"
                                            onClick={this.onCounterClicked}
                                        />
                                    </td>
                                    <td>{c.category}</td>
                                    <td>{c.aspect}</td>
                                    <td>{c.severity}</td>
                                    <td>{c.value.toString()}</td>
                                    <td>{c.rate.toString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </MainGrid.Card>
            </>
        );
    }

    private refresh() {
        let statsdb = new StatsDB(this.props.device.serial);
        statsdb.open().then(() => {
            statsdb
                .getLastElements("counters", 1)
                .then((result: (StatsDBValue & MetricPoint)[]) => {
                    if (result.length !== 1) return;

                    let filterOptions: DropdownFilterProps["options"] = [];
                    Object.keys(result[0].metrics).forEach((m) => {
                        let [category, aspect, severity, ...rest] = m.split(
                            ":"
                        );

                        if (
                            !filterOptions.find(
                                (o) => o.group === "Aspect" && o.name === aspect
                            )
                        ) {
                            filterOptions.push({
                                name: aspect,
                                group: "Aspect",
                                value: aspect,
                            });
                        }
                        if (
                            !filterOptions.find(
                                (o) =>
                                    o.group === "Category" &&
                                    o.name === category
                            )
                        ) {
                            filterOptions.push({
                                name: category,
                                group: "Category",
                                value: category,
                            });
                        }
                        if (
                            !filterOptions.find(
                                (o) =>
                                    o.group === "Severity" &&
                                    o.name === severity
                            )
                        ) {
                            filterOptions.push({
                                name: severity,
                                group: "Severity",
                                value: severity,
                            });
                        }
                    });
                    filterOptions = orderBy(filterOptions, ["name"], ["asc"]);

                    this.setState({
                        ...this.state,
                        countersPoint: result[0],
                        filterOptions,
                    });
                });
        });
    }

    private onFilterChange: DropdownFilterProps["onChange"] = (newFilter) => {
        this.setState({
            ...this.state,
            filter: newFilter,
        });
    };

    private onSortKeyChange: ColSortProps["onDirectionChange"] = (
        key: string,
        direction
    ) => {
        this.setState({
            ...this.state,
            sortKey: key,
            sortDirection: direction,
        });
    };

    private onCounterClicked = (
        name: string,
        type: DeepDiveTemplateParameter["type"]
    ) => {
        this.props.activateDDL({ name, type });
    };
}

interface CounterNameProps {
    name: string;
    type: DeepDiveTemplateParameter["type"];
    onClick: (name: string, type: DeepDiveTemplateParameter["type"]) => void;
}

export const CounterName: React.FunctionComponent<CounterNameProps> = React.memo(
    ({ name, type, onClick }) => {
        const callOnClick = (e: React.MouseEvent) => {
            onClick(name, type);

            e.preventDefault();
        };

        return (
            <a href="#" onClick={callOnClick}>
                {name}
            </a>
        );
    }
);
