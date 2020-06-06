import * as React from "react";
import { connect } from "react-redux";
import { Link, RouteComponentProps } from "react-router-dom";

import { State as StoreState } from "../../store";

import { Device } from "../../../../common/models";
import { store, actions } from "../../store";
import { MainGrid } from "../maingrid";

import { AddModal } from "./addmodal";

interface Props {
    deviceList: Device[];
    pollingDevices: string[];
}

interface State {
    selectedDeviceList: string[];
    confirmDelete: boolean;
    addDevice: boolean;
}

class InternalDeviceList extends React.Component<
    RouteComponentProps<any> & Props,
    State
> {
    state: State = {
        selectedDeviceList: [],
        confirmDelete: false,
        addDevice: false,
    };

    render() {
        let { deviceList, pollingDevices, ...rprops } = this.props;
        let { selectedDeviceList, confirmDelete, addDevice } = this.state;
        let sortedDL = deviceList.sort((a, b) =>
            a.deviceName.localeCompare(b.deviceName)
        );

        return (
            <>
                <MainGrid.Card
                    title="Device List"
                    gridCellSize={2}
                    gridStartCell={2}
                >
                    <div className="buttons">
                        <button
                            className="button is-primary"
                            onClick={this.toggleAddDevice}
                        >
                            <span className="icon">
                                <i className="fas fa-plus"></i>
                            </span>
                            <span>Add</span>
                        </button>
                        <button
                            className="button"
                            disabled={selectedDeviceList.length === 0}
                            onClick={this.toggleConfirmDelete}
                        >
                            <span className="icon">
                                <i className="fas fa-minus"></i>
                            </span>
                            <span>Delete</span>
                        </button>
                    </div>
                    <table className="table is-fullwidth is-hoverable is-narrow">
                        <thead>
                            <tr>
                                <th style={{ width: "20px" }}></th>
                                <th>Name</th>
                                <th>Status</th>
                                <th>Model</th>
                                <th>Serial</th>
                                <th>Version</th>
                                <th>URL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedDL.length !== 0 &&
                                sortedDL.map((d, idx) => (
                                    <tr
                                        key={`${idx}`}
                                        className={`${
                                            this.isSelected(d.serial)
                                                ? "is-selected"
                                                : ""
                                        }`}
                                    >
                                        <td>
                                            <label className="checkbox">
                                                <input
                                                    type="checkbox"
                                                    defaultChecked={this.isSelected(
                                                        d.serial
                                                    )}
                                                    checked={this.isSelected(
                                                        d.serial
                                                    )}
                                                    onChange={(target) =>
                                                        this.handleSelectChange(
                                                            target,
                                                            d.serial
                                                        )
                                                    }
                                                />
                                            </label>
                                        </td>
                                        <td>
                                            <Link to={`/device/${d.serial}`}>
                                                <span>{d.deviceName}</span>
                                            </Link>
                                        </td>
                                        <td className="has-text-valign-middle">
                                            {this.renderStatus(d)}
                                        </td>
                                        <td>{d.model}</td>
                                        <td>{d.serial}</td>
                                        <td>{d.swVersion}</td>
                                        <td>{d.url}</td>
                                    </tr>
                                ))}
                            {deviceList.length === 0 && (
                                <tr>
                                    <td colSpan={7}>
                                        <i>No device monitored</i>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </MainGrid.Card>
                <div className={`modal ${confirmDelete ? "is-active" : ""}`}>
                    <div className="modal-background"></div>
                    <div className="modal-card">
                        <header className="modal-card-head">
                            <p className="modal-card-title">Confirm Delete</p>
                            <button
                                className="delete is-medium"
                                aria-label="close"
                                onClick={this.toggleConfirmDelete}
                            ></button>
                        </header>
                        <section className="modal-card-body">
                            Do you really want to delete{" "}
                            {deviceList
                                .filter(
                                    (d) =>
                                        selectedDeviceList.indexOf(d.serial) !==
                                        -1
                                )
                                .map((d) => d.deviceName)
                                .join(", ")}{" "}
                            ?
                        </section>
                        <footer className="modal-card-foot">
                            <button
                                className="button"
                                onClick={() => this.toggleConfirmDelete()}
                            >
                                Cancel
                            </button>
                            <button
                                className="button is-primary"
                                onClick={() =>
                                    this.deleteDevices(selectedDeviceList)
                                }
                            >
                                Delete
                            </button>
                        </footer>
                    </div>
                </div>
                <AddModal
                    isActive={addDevice}
                    onAdd={this.toggleAddDevice}
                    onCancel={this.toggleAddDevice}
                />
            </>
        );
    }

    private isSelected(serial: string): boolean {
        return (
            this.state.selectedDeviceList.findIndex((s) => s === serial) !== -1
        );
    }

    private handleSelectChange = (
        event: React.ChangeEvent<HTMLInputElement>,
        serial: string
    ) => {
        if (event.target.checked) {
            this.setState({
                ...this.state,
                selectedDeviceList: [
                    ...this.state.selectedDeviceList.filter(
                        (s) => s !== serial
                    ),
                    serial,
                ],
            });

            return;
        }

        this.setState({
            ...this.state,
            selectedDeviceList: [
                ...this.state.selectedDeviceList.filter((s) => s !== serial),
            ],
        });
    };

    private toggleConfirmDelete = () => {
        this.setState({
            ...this.state,
            confirmDelete: !this.state.confirmDelete,
        });
    };

    private deleteDevices = (serials: string[]) => {
        store.dispatch(actions.devices.remove(serials));

        chrome.runtime.sendMessage({
            cmd: "delete",
            serials,
        });

        this.setState({
            ...this.state,
            confirmDelete: !this.state.confirmDelete,
            selectedDeviceList: [],
        });
    };

    private toggleAddDevice = () => {
        this.setState({
            ...this.state,
            addDevice: !this.state.addDevice,
        });
    };

    private renderStatus(device: Device) {
        if (device.disabled) {
            return (
                <div style={{ width: "65px" }}>
                    <div className="is-size-7 has-width-fit-content is-uppercase has-text-warning-invert has-background-warning pr-1 pl-1">
                        Disabled
                    </div>
                </div>
            );
        }
        if (Object.keys(device.error).length !== 0) {
            return (
                <div style={{ width: "65px" }}>
                    <div className="is-size-7 has-width-fit-content is-uppercase has-background-danger pr-1 pl-1">
                        Error
                    </div>
                </div>
            );
        }

        if (this.props.pollingDevices.indexOf(device.serial) !== -1) {
            return (
                <div style={{ width: "65px" }}>
                    <div className="is-size-7 is-uppercase">Polling</div>
                </div>
            );
        }

        return (
            <div style={{ width: "65px" }}>
                <div className="is-size-7 is-uppercase">OK</div>
            </div>
        );
    }
}

const mapStateToProps = (state: StoreState, props: any) => {
    return {
        deviceList: state.devices.deviceList,
        pollingDevices: state.devices.pollingDevices,
    };
};

export const DeviceList = connect(mapStateToProps)(InternalDeviceList);
