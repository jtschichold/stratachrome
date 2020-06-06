import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from "axios";

interface SendOpCmdOptions {
    vsys?: string;
}

export function init() {
    chrome.webRequest.onBeforeSendHeaders.addListener(
        (details: chrome.webRequest.WebRequestHeadersDetails) => {
            for (var i = 0; i < details.requestHeaders.length; ++i) {
                if (details.requestHeaders[i].name === "Cookie") {
                    details.requestHeaders.splice(i, 1);
                    break;
                }
            }

            return { requestHeaders: details.requestHeaders };
        },
        {
            urls: ["*://*/api/?key=*"],
            tabId: -1,
        },
        ["blocking", "requestHeaders"]
    );
    chrome.webRequest.onHeadersReceived.addListener(
        (details: chrome.webRequest.WebResponseHeadersDetails) => {
            for (var i = 0; i < details.responseHeaders.length; ++i) {
                if (details.responseHeaders[i].name === "Set-Cookie") {
                    details.responseHeaders.splice(i, 1);
                    break;
                }
            }

            return { responseHeaders: details.responseHeaders };
        },
        {
            urls: ["*://*/api/?key=*"],
            tabId: -1,
        },
        ["blocking", "responseHeaders"]
    );
}

function customAxios(url: string, timeout: number): AxiosInstance {
    return axios.create({
        baseURL: url,
        timeout: timeout * 1000,
    });
}

function getAPIResult(result: XMLDocument): Element {
    let response = result.querySelector("response");
    if (typeof response === "undefined") {
        throw "Invalid response from device: missing <response>";
    }
    let status = response.getAttribute("status");
    if (typeof status != "string") {
        throw "Invalid response from device: missing status";
    }
    if (status != "success") {
        let msg = response.querySelector("result").querySelector("msg")
            .textContent;
        throw "Request failed (" + msg + ")";
    }

    return response.querySelector("result");
}

export function keyGen(
    url: string,
    user: string,
    password: string,
    timeout: number
): Promise<string> {
    let a = customAxios(url, timeout);

    return a
        .get<any, AxiosResponse<XMLDocument>>("/api/", {
            params: { type: "keygen", user, password },
            responseType: "document",
        })
        .then(
            (response: AxiosResponse<XMLDocument>) => {
                let result = getAPIResult(response.data);
                if (typeof result !== "object") {
                    throw "Invalid result";
                }

                return result.querySelector("key").textContent;
            },
            (reason) => {
                console.error("Keygen error:", reason);
                throw reason;
            }
        );
}

export function sendOpCmd(
    url: string,
    apiKey: string,
    cmd: string,
    timeout: number,
    options?: SendOpCmdOptions
): Promise<Element> {
    let a = customAxios(url, timeout);

    let params: AxiosRequestConfig["params"] = {
        key: apiKey,
        type: "op",
        cmd,
    };

    if (options && options.vsys) {
        params["vsys"] = options.vsys;
    }

    return a
        .get<any, AxiosResponse<XMLDocument>>("/api/", {
            params,
            responseType: "document",
        })
        .then((response) => {
            return getAPIResult(response.data);
        });
}

export function sendConfigGet(
    url: string,
    apiKey: string,
    xpath: string,
    timeout: number
): Promise<Element> {
    let a = customAxios(url, timeout);

    return a
        .get<any, AxiosResponse<XMLDocument>>("/api/", {
            params: {
                key: apiKey,
                type: "config",
                xpath,
            },
            responseType: "document",
        })
        .then((response) => {
            return getAPIResult(response.data);
        });
}
