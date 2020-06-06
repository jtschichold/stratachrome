import { MetadataDB } from "../../../../common/lib/metadatadb";

import GPGWMetrics from "./gpgw";
import SessionAllMetrics from "./sessionall";

export const initOptionalPollersDB = (): Promise<string> => {
    let metadataDb = new MetadataDB();

    return metadataDb.open().then(() => {
        let metrics = [...GPGWMetrics, ...SessionAllMetrics];

        let promise = Promise.resolve("OK");
        metrics.forEach((m) => {
            promise = promise.then(() => {
                return metadataDb.put("optionalpollers", m);
            });
        });

        return promise;
    });
};
