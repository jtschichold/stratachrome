import { MetadataDB } from "../../../../common/lib/metadatadb";

import LogicalInterfaceTraffic from "./logical-interface-traffic";
import HardwareInterfaceTraffic from "./hardware-interface-traffic";
import CounterGlobalHistory from "./counter-global-history";
import ActiveSessionsOverview from "./sessions-overview";
import IngressTraffic from "./inbound-traffic";
import GlobalProtectOverview from "./global-protect";
import VsysTraffic from "./vsys-traffic";
import ZoneTraffic from "./zone-traffic";
import SessionAllOverview from "./sessions-all";

export const initDeepDivesDB = (): Promise<string> => {
    let metadataDb = new MetadataDB();

    return metadataDb.open().then(() => {
        let promise = metadataDb.put("deepdives", LogicalInterfaceTraffic);
        promise = promise.then(() =>
            metadataDb.put("deepdives", HardwareInterfaceTraffic)
        );
        promise = promise.then(() =>
            metadataDb.put("deepdives", CounterGlobalHistory)
        );
        promise = promise.then(() =>
            metadataDb.put("deepdives", ActiveSessionsOverview)
        );
        promise = promise.then(() =>
            metadataDb.put("deepdives", IngressTraffic)
        );
        promise = promise.then(() =>
            metadataDb.put("deepdives", GlobalProtectOverview)
        );
        promise = promise.then(() => metadataDb.put("deepdives", VsysTraffic));
        promise = promise.then(() => metadataDb.put("deepdives", ZoneTraffic));
        promise = promise.then(() =>
            metadataDb.put("deepdives", SessionAllOverview)
        );

        return promise;
    });
};
