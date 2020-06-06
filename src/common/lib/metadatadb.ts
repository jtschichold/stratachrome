// Released under MIT License by Luigi Mori. January 2013.

const DBNAME = "metadata";

export type MetadataDBOstore = "deepdives" | "preferences" | "optionalpollers";

export class MetadataDB {
    private static db: IDBDatabase = null;

    open(): Promise<string> {
        if (MetadataDB.db) {
            return Promise.resolve("OK");
        }

        return new Promise((resolve, reject) => {
            let req = indexedDB.open(DBNAME, 1);

            req.onsuccess = function (event) {
                MetadataDB.db = (event as any).target.result;

                resolve("OK");
            };
            req.onerror = function (event) {
                reject((event as any).error);
            };
            req.onupgradeneeded = function (event) {
                console.log("MetadataDB onupgradeneeded");
                MetadataDB.db = (event as any).target.result;

                let osDeepDives = MetadataDB.db.createObjectStore("deepdives", {
                    keyPath: "id",
                });

                let osPreferences = MetadataDB.db.createObjectStore(
                    "preferences",
                    {
                        keyPath: "serial",
                    }
                );

                let osOptionalMetrics = MetadataDB.db.createObjectStore(
                    "optionalpollers",
                    {
                        keyPath: "id",
                    }
                );

                (event as any).target.transaction.oncomplete = () => {
                    console.log("MetadataDB upgrade done");
                    resolve("OK");
                };
            };
        });
    }

    close() {
        if (!MetadataDB.db) return;

        MetadataDB.db.close();
        MetadataDB.db = null;
    }

    put<T>(ostore: MetadataDBOstore, value: T): Promise<string> {
        return new Promise((resolve, reject) => {
            let trans = MetadataDB.db.transaction([ostore], "readwrite");
            trans.onerror = (event) => {
                console.error("Error in put transaction to deepdives");
                reject("Error in transaction to deepdives");
            };
            let objstore = trans.objectStore(ostore);
            let req = objstore.put(value);
            req.onerror = (event) => {
                reject("Error upserting object to deepdives");
            };
            req.onsuccess = (event) => {
                resolve("Successfully upserted object to deepdives");
            };
        });
    }

    loadAll<T>(ostore: MetadataDBOstore): Promise<T[]> {
        return new Promise((resolve, reject) => {
            let self = this;

            let trans = MetadataDB.db.transaction(ostore, "readonly");
            trans.onerror = function (event) {
                console.error("Error in transaction to deepdives");
                reject(event);
            };

            let objectStore = trans.objectStore(ostore);
            let req = objectStore.getAll();
            req.onerror = function (err) {
                reject("Error in opening cursor on deepdives: " + err);
            };
            req.onsuccess = function (event) {
                resolve((event as any).target.result || []);
            };
        });
    }

    get<T>(ostore: MetadataDBOstore, key: string): Promise<T> {
        return new Promise((resolve, reject) => {
            let self = this;

            let trans = MetadataDB.db.transaction(ostore, "readonly");
            trans.onerror = function (event) {
                console.error("Error in transaction to deepdives");
                reject(event);
            };

            let objectStore = trans.objectStore(ostore);
            let req = objectStore.get(key);
            req.onerror = function (err) {
                reject("Error in opening cursor on deepdives: " + err);
            };
            req.onsuccess = function (event) {
                resolve((event as any).target.result);
            };
        });
    }
}
