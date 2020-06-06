import * as React from "react";

import {
    Device,
    DeviceHwInterface,
    DeviceLogicalInterface,
    InterfacePoint,
    InterfaceDelta,
    DeepDiveTemplateParameter,
} from "../../../../../common/models";
import { deviceNotificationsReceiver } from "../../../lib/devicenotifications";
import { StatsDB } from "../../../../../common/lib/statsdb";
import { itFormatter } from "../../../lib/utils";
import { DropdownFilter, DropdownFilterProps } from "../../controls";
import { MainGrid } from "../../maingrid";
import { store, actions } from "../../../store";
import { DeepDiveLightBoxSessionState } from "./deepdive";

interface Props {
    device: Device;
    activateDDL: (param: DeepDiveTemplateParameter) => void;
}

interface State {
    ifsPoint: InterfacePoint | null;
    filterOptions: DropdownFilterProps["options"];
    filter: DropdownFilterProps["value"];
}

export class Interfaces extends React.Component<Props, State> {
    private listnerId: number = null;

    state: State = {
        ifsPoint: null,
        filterOptions: [],
        filter: [],
    };

    componentDidMount() {
        this.refresh();

        this.listnerId = deviceNotificationsReceiver.addListener(
            this.props.device.serial,
            (utype) => {
                if (utype !== "ifs") return;

                this.refresh();
            }
        );

        let { logicalInterfaces } = this.props.device;
        let filterOptions: DropdownFilterProps["options"] = [];
        let configuredVsys: string[] = [];
        let configuredZones: string[] = [];

        logicalInterfaces.forEach((logicalInterface) => {
            if (
                logicalInterface.vsys &&
                configuredVsys.indexOf(logicalInterface.vsys) === -1
            ) {
                configuredVsys.push(logicalInterface.vsys);
            }
            if (
                logicalInterface.zone &&
                configuredZones.indexOf(logicalInterface.zone) === -1
            ) {
                configuredZones.push(logicalInterface.zone);
            }
        });
        if (configuredVsys.length > 1) {
            configuredVsys.forEach((vsysName) => {
                filterOptions.push({
                    name: vsysName,
                    group: "Vsys",
                    value: vsysName,
                });
            });
        }
        configuredZones.forEach((zoneName) => {
            filterOptions.push({
                name: zoneName,
                group: "Zone",
                value: zoneName,
            });
        });
        filterOptions.push({
            name: "Hide Down",
            group: "State",
            value: "hd",
        });
        filterOptions.push({
            name: "Hide Not Configured",
            group: "State",
            value: "hnc",
        });

        this.setState({
            ...this.state,
            filterOptions,
        });
    }

    componentWillUnmount() {
        deviceNotificationsReceiver.removeListener(
            this.props.device.serial,
            this.listnerId
        );
    }

    shouldComponentUpdate(nextProps: Props, nextState: State) {
        if (this.props.device.serial !== nextProps.device.serial) return true;

        if (
            this.props.device.hwInterfaces.length !==
            nextProps.device.hwInterfaces.length
        )
            return true;
        if (
            this.props.device.logicalInterfaces.length !==
            nextProps.device.logicalInterfaces.length
        )
            return true;

        if (this.state.ifsPoint !== nextState.ifsPoint) return true;
        if (this.state.filter !== nextState.filter) return true;
        if (this.state.filterOptions !== nextState.filterOptions) return true;

        return false;
    }

    render() {
        let { ifsPoint, filter, filterOptions } = this.state;
        let { hwInterfaces, logicalInterfaces } = this.props.device;

        if (!ifsPoint)
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

        let hideDown =
            filter.findIndex((o) => o.value === "hd" && o.group === "State") !==
            -1;
        let hideNotConfigured =
            filter.findIndex(
                (o) => o.value === "hnc" && o.group === "State"
            ) !== -1;
        let selectZone = filter.findIndex((o) => o.group === "Zone") !== -1;
        let selectVsys = filter.findIndex((o) => o.group === "Vsys") !== -1;
        let selectedHardwareIntarfaces = hwInterfaces.filter((hwInterface) => {
            if (!hideDown) return true;

            return (
                hwInterface.status && hwInterface.status.indexOf("down") === -1
            );
        });

        let selectedLogicalInterfaces = logicalInterfaces.filter(
            (logicalInterface) => {
                if (hideNotConfigured && !logicalInterface.zone) return false;

                if (
                    !selectedHardwareIntarfaces.find((hwInterface) =>
                        logicalInterface.name.startsWith(hwInterface.name)
                    )
                ) {
                    return false;
                }

                if (
                    selectVsys &&
                    (!logicalInterface.vsys ||
                        !filter.find(
                            (o) =>
                                o.group === "Vsys" &&
                                o.value === logicalInterface.vsys
                        ))
                ) {
                    return false;
                }

                if (
                    selectZone &&
                    (!logicalInterface.zone ||
                        !filter.find(
                            (o) =>
                                o.group === "Zone" &&
                                o.value === logicalInterface.zone
                        ))
                ) {
                    return false;
                }

                return true;
            }
        );

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
                {this.renderLogicalInterfaces(
                    selectedLogicalInterfaces,
                    ifsPoint.logicalInterfaces
                )}
                {this.renderHwInterfaces(
                    selectedHardwareIntarfaces,
                    ifsPoint.hwInterfaces
                )}
            </>
        );
    }

    private renderHwInterfaces(
        hwInterfaces: DeviceHwInterface[],
        hwInterfaceStats: InterfacePoint["hwInterfaces"]
    ): JSX.Element {
        return (
            <MainGrid.Card
                cardTitle={<span>Hardware Interfaces</span>}
                gridStartCell={2}
                gridCellSize={2}
            >
                <table className="table is-fullwidth is-hoverable is-narrow">
                    <thead>
                        <tr>
                            <th style={{ width: "150px" }}>Name</th>
                            <th style={{ width: "200px" }}>Info</th>
                            <th style={{ width: "150px" }}>Bitrate</th>
                            <th style={{ width: "150px" }}>Packets</th>
                            <th style={{ width: "100px" }}>Errors</th>
                            <th style={{ width: "100px" }}>Drops</th>
                        </tr>
                    </thead>
                    <tbody>
                        {hwInterfaces
                            .filter(
                                (i) =>
                                    typeof hwInterfaceStats[i.name] !==
                                    "undefined"
                            )
                            .map((i) => (
                                <tr>
                                    <td>
                                        <InterfaceName
                                            name={i.name}
                                            type="HardwareInterface"
                                            onClick={this.onInterfaceClicked}
                                        />
                                    </td>
                                    <td>{i.status}</td>
                                    <td>
                                        <div>
                                            <div className="is-flex-center">
                                                <div
                                                    className="is-semi-transparent has-text-right pr-1"
                                                    style={{
                                                        width: "25px",
                                                    }}
                                                >
                                                    in
                                                </div>
                                                {this.deltaFormatter(
                                                    hwInterfaceStats[i.name]
                                                        .ibytes,
                                                    0,
                                                    "bps",
                                                    8
                                                )}
                                            </div>
                                            <div className="is-flex-center">
                                                <div
                                                    className="is-semi-transparent has-text-right pr-1"
                                                    style={{
                                                        width: "25px",
                                                    }}
                                                >
                                                    out
                                                </div>
                                                {this.deltaFormatter(
                                                    hwInterfaceStats[i.name]
                                                        .obytes,
                                                    0,
                                                    "bps",
                                                    8
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div>
                                            <div className="is-flex-center">
                                                <div
                                                    className="is-semi-transparent has-text-right pr-1"
                                                    style={{
                                                        width: "25px",
                                                    }}
                                                >
                                                    in
                                                </div>
                                                {this.deltaFormatter(
                                                    hwInterfaceStats[i.name]
                                                        .ipackets,
                                                    0,
                                                    "pps"
                                                )}
                                            </div>
                                            <div className="is-flex-center">
                                                <div
                                                    className="is-semi-transparent has-text-right pr-1"
                                                    style={{
                                                        width: "25px",
                                                    }}
                                                >
                                                    out
                                                </div>
                                                {this.deltaFormatter(
                                                    hwInterfaceStats[i.name]
                                                        .opackets,
                                                    0,
                                                    "pps"
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="is-flex-center">
                                            {this.deltaFormatter(
                                                hwInterfaceStats[i.name]
                                                    .ierrors,
                                                0,
                                                "pps"
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="is-flex-center">
                                            {this.deltaFormatter(
                                                hwInterfaceStats[i.name].idrops,
                                                0,
                                                "pps"
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </MainGrid.Card>
        );
    }

    private renderLogicalInterfaces(
        logicalInterfaces: DeviceLogicalInterface[],
        logicalInterfaceStats: InterfacePoint["logicalInterfaces"]
    ): JSX.Element {
        return (
            <MainGrid.Card
                cardTitle={<span>Logical Interfaces</span>}
                gridCellSize={2}
                gridStartCell={2}
            >
                <table className="table is-fullwidth is-hoverable is-narrow">
                    <thead>
                        <tr>
                            <th style={{ width: "160px" }}>Name</th>
                            <th style={{ width: "200px" }}>Info</th>
                            <th style={{ width: "150px" }}>Bitrate</th>
                            <th style={{ width: "150px" }}>Packets</th>
                            <th style={{ width: "100px" }}>Errors</th>
                            <th style={{ width: "100px" }}>Drops</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logicalInterfaces
                            .filter(
                                (i) =>
                                    typeof logicalInterfaceStats[i.name] !==
                                    "undefined"
                            )
                            .map((i) => (
                                <tr>
                                    <td>
                                        <InterfaceName
                                            name={i.name}
                                            type="LogicalInterface"
                                            onClick={this.onInterfaceClicked}
                                        />
                                    </td>
                                    <td>
                                        <VsysZone vsys={i.vsys} zone={i.zone} />
                                    </td>
                                    <td>
                                        <div>
                                            <div className="is-flex-center">
                                                <div
                                                    className="is-semi-transparent has-text-right pr-1"
                                                    style={{
                                                        width: "25px",
                                                    }}
                                                >
                                                    in
                                                </div>
                                                {this.deltaFormatter(
                                                    logicalInterfaceStats[
                                                        i.name
                                                    ].ibytes,
                                                    0,
                                                    "bps",
                                                    8
                                                )}
                                            </div>
                                            <div className="is-flex-center">
                                                <div
                                                    className="is-semi-transparent has-text-right pr-1"
                                                    style={{
                                                        width: "25px",
                                                    }}
                                                >
                                                    out
                                                </div>
                                                {this.deltaFormatter(
                                                    logicalInterfaceStats[
                                                        i.name
                                                    ].obytes,
                                                    0,
                                                    "bps",
                                                    8
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div>
                                            <div className="is-flex-center">
                                                <div
                                                    className="is-semi-transparent has-text-right pr-1"
                                                    style={{
                                                        width: "25px",
                                                    }}
                                                >
                                                    in
                                                </div>
                                                {this.deltaFormatter(
                                                    logicalInterfaceStats[
                                                        i.name
                                                    ].ipackets,
                                                    0,
                                                    "pps"
                                                )}
                                            </div>
                                            <div className="is-flex-center">
                                                <div
                                                    className="is-semi-transparent has-text-right pr-1"
                                                    style={{
                                                        width: "25px",
                                                    }}
                                                >
                                                    out
                                                </div>
                                                {this.deltaFormatter(
                                                    logicalInterfaceStats[
                                                        i.name
                                                    ].opackets,
                                                    0,
                                                    "pps"
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="is-flex-center">
                                            {this.deltaFormatter(
                                                logicalInterfaceStats[i.name]
                                                    .ierrors,
                                                0,
                                                "pps"
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="is-flex-center">
                                            {this.deltaFormatter(
                                                logicalInterfaceStats[i.name]
                                                    .idrops,
                                                0,
                                                "pps"
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </MainGrid.Card>
        );
    }

    private refresh() {
        let statsdb = new StatsDB(this.props.device.serial);
        statsdb.open().then(() => {
            statsdb.getLastElements("ifs", 1).then((result) => {
                if (result.length !== 1) return;

                this.setState({
                    ...this.state,
                    ifsPoint: result[0] as any,
                });
            });
        });
    }

    private deltaFormatter(
        delta: InterfaceDelta,
        fractionalDigits: number,
        suffix: string,
        multiplier?: number
    ): JSX.Element {
        multiplier = multiplier || 1;
        let base =
            !delta.v && !delta.zf
                ? itFormatter(0.1, fractionalDigits)
                : itFormatter(delta.v * BigInt(multiplier), fractionalDigits);

        return (
            <>
                <span>{base + suffix}</span>
                {!delta.zf && (
                    <span
                        className={`icon pl-2 is-semi-transparent ${
                            delta.u ? "" : "is-hidden"
                        }`}
                    >
                        <i className="fas fa-plus fa-xs fa-fw"></i>
                    </span>
                )}
                {!delta.zf && (
                    <span
                        className={`icon pl-2 is-semi-transparent ${
                            delta.u ? "is-hidden" : ""
                        }`}
                    >
                        <i className="fas fa-minus fa-xs fa-fw"></i>
                    </span>
                )}
                {delta.zf && (
                    <span className="icon pl-2 is-semi-transparent">
                        <i className="fas fa-equals fa-xs fa-fw"></i>
                    </span>
                )}
            </>
        );
    }

    private onFilterChange: DropdownFilterProps["onChange"] = (newFilter) => {
        this.setState({
            ...this.state,
            filter: newFilter,
        });
    };

    private onInterfaceClicked = (
        name: string,
        type: DeepDiveTemplateParameter["type"]
    ) => {
        this.props.activateDDL({ name, type });
    };
}

interface InterfaceNameProps {
    name: string;
    type: DeepDiveTemplateParameter["type"];
    onClick: (name: string, type: DeepDiveTemplateParameter["type"]) => void;
}

export const InterfaceName: React.FunctionComponent<InterfaceNameProps> = ({
    name,
    type,
    onClick,
}) => {
    const callOnClick = (e: React.MouseEvent) => {
        onClick(name, type);

        e.preventDefault();
    };

    return (
        <a href="#" onClick={callOnClick}>
            {name}
        </a>
    );
};

const VsysZone: React.FunctionComponent<{ vsys: string; zone: string }> = ({
    vsys,
    zone,
}) => {
    const onVsys = () => {
        let ddlboxState: DeepDiveLightBoxSessionState = {
            target: "parameter",
            parameterValue: {
                value: vsys,
                type: "Vsys",
            },
        };

        store.dispatch(actions.state.upsert("ddlboxState", ddlboxState));
    };

    const onZone = () => {
        let ddlboxState: DeepDiveLightBoxSessionState = {
            target: "parameter",
            parameterValue: {
                value: zone,
                type: "Zone",
            },
        };

        store.dispatch(actions.state.upsert("ddlboxState", ddlboxState));
    };

    return (
        <>
            <a onClick={onVsys}>{`vsys${vsys}`}</a>
            <span>/</span>
            <a onClick={onZone}>{zone}</a>
        </>
    );
};
