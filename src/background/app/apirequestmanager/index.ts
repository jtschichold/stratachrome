import { store } from "../store";
import * as panosXMLAPI from "../../../common/lib/panosxmlapi";
import { APIOpCmd } from "./cmds";
import { APIConfigXPath } from "./configxpaths";
import { Device } from "../../../common/models";

export * from "./cmds";
export * from "./configxpaths";

interface APIRequestKeyGen {
    type: "keygen";
    url: string;
    resolve: (result: string) => void;
    reject: (response: any) => void;

    user: string;
    password: string;
}

interface APIRequestOp {
    type: "op";
    url: string;
    apiKey: string;
    serial: string;
    vsys?: string;

    resolve: (result: Element) => void;
    reject: (response: any) => void;

    cmd: APIOpCmd;
}

interface APIRequestGetConfig {
    type: "config";
    url: string;
    apiKey: string;
    serial: string;

    resolve: (result: Element) => void;
    reject: (response: any) => void;

    xpath: APIConfigXPath;
}

type APIRequest = APIRequestKeyGen | APIRequestOp | APIRequestGetConfig;

interface APIRequestInFly {
    _id: number;
    promise: Promise<string | Element>;
}

class APIRequestManager {
    private queues: { [url: string]: APIRequest[] };
    private infly: { [url: string]: APIRequestInFly[] };

    private requestTimeout: number = 0;
    private maxRunningReq: number = 0;
    private nextReq: number = 0;

    constructor() {
        this.queues = {};
        this.infly = {};

        store.subscribe(() => {
            this.applyConfig();
        });
        panosXMLAPI.init();
    }

    public keyGen(
        url: string,
        user: string,
        password: string
    ): Promise<string> {
        return new Promise((resolve, reject) => {
            this.addToQueue(url, {
                type: "keygen",
                resolve,
                reject,
                url,
                user,
                password,
            });
        });
    }

    public sendOpCmd(
        url: string,
        apiKey: string,
        serial: string,
        cmd: string,
        vsys?: string
    ): Promise<Element> {
        return new Promise((resolve, reject) => {
            this.addToQueue(url, {
                type: "op",
                url,
                apiKey,
                serial,
                vsys,
                resolve,
                reject,
                cmd,
            });
        });
    }

    public sendConfigGet(
        url: string,
        apiKey: string,
        serial: string,
        xpath: string
    ): Promise<Element> {
        return new Promise((resolve, reject) => {
            this.addToQueue(url, {
                type: "config",
                url,
                apiKey,
                serial,
                resolve,
                reject,
                xpath,
            });
        });
    }

    cancelQueuedByDevice(device: Device) {
        if (this.queues[device.url]) {
            this.queues[device.url] = this.queues[device.url].filter(
                (r) =>
                    r.url === device.url &&
                    r.type === "op" &&
                    r.serial === device.serial
            );
        }
    }

    private applyConfig(): void {
        let newKnob = store
            .getState()
            .config.store.find((e) => e.key === "requestTimeout");
        if (newKnob) {
            this.requestTimeout = newKnob.value;
        }
        newKnob = store
            .getState()
            .config.store.find((e) => e.key === "maxRunningReq");
        if (newKnob) {
            this.maxRunningReq = newKnob.value;
        }
    }

    private addToQueue(url: string, request: APIRequest) {
        if (typeof this.queues[url] === "undefined") {
            this.queues[url] = [];
        }
        this.queues[url].unshift(request);

        this.schedule();
    }

    private addToInfly(url: string, request: APIRequestInFly) {
        if (typeof this.infly[url] === "undefined") {
            this.infly[url] = [];
        }
        this.infly[url].unshift(request);

        request.promise.finally(() => {
            this.infly[url] = [
                ...this.infly[url].filter((r) => r._id !== request._id),
            ];

            this.schedule();
        });
    }

    private schedule() {
        for (let key in this.queues) {
            if (
                this.queues[key].length !== 0 &&
                (typeof this.infly[key] === "undefined" ||
                    this.infly[key].length < this.maxRunningReq)
            ) {
                let request = this.queues[key].pop();
                let promise = this.performRequest(request);
                this.addToInfly(key, promise);
            }
        }
    }

    private performRequest(request: APIRequest): APIRequestInFly {
        let promise: Promise<any>;

        let _id = this.nextReq;
        this.nextReq += 1;

        switch (request.type) {
            case "keygen":
                request = request as APIRequestKeyGen;
                promise = panosXMLAPI
                    .keyGen(
                        request.url,
                        request.user,
                        request.password,
                        this.requestTimeout
                    )
                    .then(
                        (result) => {
                            (request as APIRequestKeyGen).resolve(result);
                        },
                        (reason) => {
                            request.reject(reason);
                        }
                    );
                break;

            case "op":
                request = request as APIRequestOp;
                promise = panosXMLAPI
                    .sendOpCmd(
                        request.url,
                        request.apiKey,
                        request.cmd,
                        this.requestTimeout,
                        { vsys: request.vsys }
                    )
                    .then(
                        (result) => {
                            (request as APIRequestOp).resolve(result);
                        },
                        (reason) => {
                            request.reject(reason);
                        }
                    );
                break;

            case "config":
                request = request as APIRequestGetConfig;
                promise = panosXMLAPI
                    .sendConfigGet(
                        request.url,
                        request.apiKey,
                        request.xpath,
                        this.requestTimeout
                    )
                    .then(
                        (result) => {
                            (request as APIRequestGetConfig).resolve(result);
                        },
                        (reason) => {
                            request.reject(reason);
                        }
                    );
                break;
        }

        if (typeof promise === "undefined") {
            promise = Promise.reject("Unknown API request");
        }

        return {
            _id,
            promise,
        };
    }
}

export const apiRequestManger = new APIRequestManager();
