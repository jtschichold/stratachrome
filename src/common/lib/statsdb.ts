// Released under MIT License by Luigi Mori. January 2013.

const DBNAME = "metrics";

export interface StatsDBValue {
    date: number;
    serial: string;
}

export type StatsDBOStore =
    | "ifs"
    | "dp"
    | "mp"
    | "sessions"
    | "counters"
    | "gp";

export class StatsDB {
    private map60mcache = {};
    private static db: IDBDatabase = null;

    constructor(private serial: string) {}

    open(): Promise<string> {
        return this.openDB();
    }

    openDB(): Promise<string> {
        if (StatsDB.db) {
            return Promise.resolve("OK");
        }

        return new Promise((resolve, reject) => {
            let statsdb: StatsDB = this;
            let req = indexedDB.open(DBNAME, 1);

            req.onsuccess = function (event) {
                StatsDB.db = (event as any).target.result;

                resolve("OK");
            };
            req.onerror = function (event) {
                reject((event as any).error);
            };
            req.onupgradeneeded = function (event) {
                console.log("onupgradeneeded");
                StatsDB.db = (event as any).target.result;

                console.log("init db");

                let osIFS = StatsDB.db.createObjectStore("ifs", {
                    autoIncrement: true,
                });
                osIFS.createIndex("date", "date", { unique: false });

                let osDP = StatsDB.db.createObjectStore("dp", {
                    autoIncrement: true,
                });
                osDP.createIndex("date", "date", { unique: false });

                let osCP = StatsDB.db.createObjectStore("mp", {
                    autoIncrement: true,
                });
                osCP.createIndex("date", "date", { unique: false });

                let osSessionInfo = StatsDB.db.createObjectStore("sessions", {
                    autoIncrement: true,
                });
                osSessionInfo.createIndex("date", "date", { unique: false });

                let osCounters = StatsDB.db.createObjectStore("counters", {
                    autoIncrement: true,
                });
                osCounters.createIndex("date", "date", { unique: false });

                let osGP = StatsDB.db.createObjectStore("gp", {
                    autoIncrement: true,
                });
                osGP.createIndex("date", "date", { unique: false });

                (event as any).target.transaction.oncomplete = () => {
                    console.log("MetadataDB upgrade done");
                    resolve("OK");
                };
            };
        });
    }

    add(ostore: StatsDBOStore, value: any): Promise<string> {
        return new Promise((resolve, reject) => {
            value.serial = this.serial;
            value.date = new Date().getTime();

            let trans = StatsDB.db.transaction([ostore], "readwrite");
            trans.onerror = (event) => {
                console.error("Error in add transaction to " + ostore);
                reject("Error in transaction to " + ostore);
            };
            let objstore = trans.objectStore(ostore);
            let req = objstore.add(value);
            req.onerror = (event) => {
                reject("Error adding object to " + ostore);
            };
            req.onsuccess = (event) => {
                resolve("Successfully added new object to " + ostore);
            };

            // flush cache
            delete this.map60mcache[ostore];
            this.map60mcache[ostore] = {};
        });
    }

    shutdown() {}

    getLastElements(ostore: StatsDBOStore, n): Promise<StatsDBValue[]> {
        return new Promise((resolve, reject) => {
            let res = [];

            let trans = StatsDB.db.transaction(ostore);
            let self: StatsDB = this;

            trans.onerror = (event) => {
                console.error("Error in gle transaction to " + ostore);
            };

            let objectStore = trans.objectStore(ostore);

            let req = objectStore.openCursor(
                null,
                "prev" /* window.webkitIDBCursor.PREV */
            );
            req.onerror = (err) => {
                reject("Error in opening cursor on " + ostore + ": " + err);
            };
            req.onsuccess = (event) => {
                let cursor: IDBCursorWithValue = (event as any).target.result;
                if (cursor) {
                    if (cursor.value.serial !== self.serial) {
                        cursor.continue();
                        return;
                    }

                    res.push(cursor.value);
                    if (res.length == n) {
                        resolve(res);
                        return;
                    }
                    cursor.continue();
                } else {
                    resolve(res);
                }
            };
        });
    }

    eachLast60Minutes<T, R>(
        ostore: StatsDBOStore,
        callback: (e: T) => R
    ): Promise<number> {
        let oneHourAgo = new Date().getTime() - 3600 * 1000;
        return this.forEachSince(ostore, oneHourAgo, callback);
    }

    forEachSince<T, R>(
        ostore: StatsDBOStore,
        since: number,
        callback: (e: T) => R
    ): Promise<number> {
        return new Promise((resolve, reject) => {
            let self = this;

            let trans = StatsDB.db.transaction(ostore);
            trans.onerror = function (event) {
                console.error("Error in forEachSince transaction to " + ostore);
                reject(event);
            };

            let objectStore = trans.objectStore(ostore);

            let now = new Date().getTime();
            if (since > now) {
                reject("Since is in the future");
            }

            let nv = 0;

            let idx = objectStore.index("date");
            let req = idx.openCursor(
                window.IDBKeyRange.bound(since, now, true, true),
                "next" /*window.webkitIDBCursor.PREV*/
            );
            req.onerror = function (err) {
                reject("Error in opening cursor on " + ostore + ": " + err);
            };
            req.onsuccess = function (event) {
                var cursor: IDBCursorWithValue = (event as any).target.result;
                if (cursor) {
                    if (cursor.value.serial != self.serial) {
                        cursor.continue();
                        return;
                    }

                    callback(cursor.value);
                    nv = nv + 1;
                    cursor.continue();
                } else {
                    resolve(nv);
                }
            };
        });
    }

    mapLast60Minutes<T, R>(
        ostore: StatsDBOStore,
        callback: (e: T) => R,
        label?: string
    ): Promise<R[]> {
        return new Promise((resolve, reject) => {
            let result = [];
            let self = this;

            if (typeof label != "undefined") {
                if (typeof this.map60mcache[ostore] != "undefined") {
                    if (typeof this.map60mcache[ostore][label] != "undefined") {
                        resolve(this.map60mcache[ostore][label]);
                    }
                }
            }

            this.eachLast60Minutes<T, void>(ostore, function (e) {
                result.push(callback(e));
            }).then(
                function (n) {
                    if (typeof label != "undefined") {
                        self.map60mcache[ostore] =
                            self.map60mcache[ostore] || {};
                        self.map60mcache[ostore][label] = result;
                    }

                    resolve(result);
                },
                function (err) {
                    reject(err);
                }
            );
        });
    }

    static delete(from: number): Promise<string> {
        if (!StatsDB.db) return Promise.reject("DB not open");

        let trans = StatsDB.db.transaction(
            StatsDB.db.objectStoreNames as any,
            "readwrite"
        );

        trans.onerror = (event) => {
            Promise.reject("Error in gle transaction");
        };

        let promise: Promise<string> = Promise.resolve("ok");

        for (let ostoreName of StatsDB.db
            .objectStoreNames as any /* XXX to keep tscript happy*/) {
            promise = promise.then(
                () =>
                    new Promise((resolve, reject) => {
                        let objectStore = trans.objectStore(ostoreName);
                        let idx = objectStore.index("date");
                        let reqKeys = idx.getAllKeys(
                            IDBKeyRange.upperBound(from)
                        );
                        reqKeys.onerror = (err) => {
                            reject(
                                "Error getting all keys in " +
                                    ostoreName +
                                    ": " +
                                    err
                            );
                        };
                        reqKeys.onsuccess = (ev) => {
                            if (
                                !reqKeys.result ||
                                reqKeys.result.length === 0
                            ) {
                                resolve("OK");
                                return;
                            }

                            let sortedKeys = reqKeys.result; /* XXX .sorted() */
                            // console.log("Deleting: ", sortedKeys.map(v => ''+v).join(","));

                            let key: IDBValidKey | IDBKeyRange = sortedKeys[0];
                            if (sortedKeys.length > 1) {
                                key = IDBKeyRange.bound(
                                    sortedKeys[0],
                                    sortedKeys[sortedKeys.length - 1],
                                    false,
                                    false
                                );
                            }
                            let reqDelete = objectStore.delete(key);

                            reqDelete.onerror = (err) => {
                                reject(
                                    "Error deleting keys in " +
                                        ostoreName +
                                        ": " +
                                        err
                                );
                            };
                            reqDelete.onsuccess = () => {
                                resolve("OK");
                            };
                        };
                    })
            );
        }

        return promise;
    }

    static deleteAll() {
        indexedDB.deleteDatabase(DBNAME);

        // old database
        indexedDB.deleteDatabase("panwachrome");
    }
}
