import { apiRequestManger } from "../../apirequestmanager";
import { store, actions } from "../../store";
import { Device } from "../../../../common/models";
import { StatsDB } from "../../../../common/lib/statsdb";

export interface VsysElementR {
    vsys: string;
    apiRequestResult: Element;
}

export interface MultiyOpCmdR {
    metric: string;
    apiRequestResult: Element;
}

export abstract class Monitor<R> {
    isIdle = true;
    isDisabled: boolean = false;

    private isCanceled: boolean = false;
    protected trackingInterval: number = 30;
    private runningTimeout: any;

    protected trackingIntervalKey = "trackingInterval";

    constructor(protected device: Device, protected statsdb: StatsDB) {
        this.applyConfig();
        store.subscribe(() => {
            this.applyConfig();
        });
    }

    start() {
        setTimeout(() => this.poll(), 0);
    }

    poll(force?: boolean) {
        if (this.isCanceled) {
            return;
        }

        if (this.isDisabled && !force) {
            return;
        }

        if (typeof this.runningTimeout === "number") {
            clearTimeout(this.runningTimeout);
        }
        this.runningTimeout = null;
        this.isIdle = false;
        store.dispatch(actions.devices.incPolling(this.device.serial));

        this.apiRequest()
            .then((result) => {
                return this.handleResult(result);
            })
            .then(
                () => {
                    // reset error
                    store.dispatch(
                        actions.devices.setError(
                            this.device.serial,
                            this.constructor.name,
                            null
                        )
                    );
                },
                (reason) => {
                    // set error
                    store.dispatch(
                        actions.devices.setError(
                            this.device.serial,
                            this.constructor.name,
                            "" + reason
                        )
                    );
                }
            )
            .finally(() => {
                this.isIdle = true;
                store.dispatch(actions.devices.decPolling(this.device.serial));

                if (this.isCanceled) return;

                this.runningTimeout = window.setTimeout(
                    () => this.poll(),
                    this.trackingInterval * 1000
                );
            });
    }

    cancel() {
        this.isCanceled = true;
    }

    applyConfig() {
        let newKnob = store
            .getState()
            .config.store.find((e) => e.key === this.trackingIntervalKey);
        if (newKnob) {
            this.trackingInterval = newKnob.value;
        }
    }

    disable() {
        this.isDisabled = true;
    }

    enable() {
        this.isDisabled = false;
    }

    abstract apiRequest(): Promise<R>;

    abstract handleResult(result: R): Promise<any>;
}

export abstract class OpCmdMonitor extends Monitor<Element> {
    abstract opCmd: string;

    apiRequest() {
        return apiRequestManger.sendOpCmd(
            this.device.url,
            this.device.apiKey,
            this.device.serial,
            this.opCmd
        );
    }
}

export abstract class VsysOpCmdMonitor extends Monitor<VsysElementR[]> {
    abstract opCmd: string;

    apiRequest() {
        // XXX we serialize requests, should we let the API Request Manager
        // handle this?
        let promise = apiRequestManger.sendOpCmd(
            this.device.url,
            this.device.apiKey,
            this.device.serial,
            this.opCmd
        );
        let result: Promise<VsysElementR[]> = promise.then(
            (apiRequestResult) => {
                return [
                    {
                        vsys: "root",
                        apiRequestResult,
                    },
                ];
            }
        );

        for (let vsys of this.device.vsysList) {
            result = result.then((accresult) => {
                return apiRequestManger
                    .sendOpCmd(
                        this.device.url,
                        this.device.apiKey,
                        this.device.serial,
                        this.opCmd,
                        vsys
                    )
                    .then((apiRequestResult) => {
                        accresult.push({
                            vsys,
                            apiRequestResult,
                        });

                        return accresult;
                    });
            });
        }

        return result;
    }
}

export abstract class MultyOpCmdMonitor extends Monitor<MultiyOpCmdR[]> {
    abstract opCmds: { metric: string; opCmd: string }[];

    apiRequest() {
        let promise: Promise<MultiyOpCmdR[]> = null;

        this.opCmds.forEach((op) => {
            if (promise === null) {
                promise = apiRequestManger
                    .sendOpCmd(
                        this.device.url,
                        this.device.apiKey,
                        this.device.serial,
                        op.opCmd
                    )
                    .then((r) => {
                        return [
                            {
                                metric: op.metric,
                                apiRequestResult: r,
                            },
                        ];
                    });

                return;
            }

            promise = promise.then((results) => {
                return apiRequestManger
                    .sendOpCmd(
                        this.device.url,
                        this.device.apiKey,
                        this.device.serial,
                        op.opCmd
                    )
                    .then((r) => {
                        results.push({
                            metric: op.metric,
                            apiRequestResult: r,
                        });

                        return results;
                    });
            });
        });

        return promise;
    }
}
