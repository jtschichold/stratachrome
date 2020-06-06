import { store } from "../store";
import { StatsDB } from "../../../common/lib/statsdb";

class StatsDBGC {
    private maxHistory: number;
    private timeoutGC: number;
    private frequencyGC: number = 15 * 60000;

    constructor() {
        store.subscribe(() => {
            this.applyConfig();
        });

        this.timeoutGC = window.setTimeout(() => this.gc(), this.frequencyGC); // 15 minutes
    }

    private applyConfig(): void {
        let newKnob = store
            .getState()
            .config.store.find((e) => e.key === "maxHistory");
        if (newKnob) {
            this.maxHistory = newKnob.value;
        }
    }

    private gc(): void {
        if (!this.maxHistory) {
            this.timeoutGC = window.setTimeout(
                () => this.gc(),
                this.frequencyGC
            );
            return;
        }

        StatsDB.delete(
            new Date().getTime() - this.maxHistory * 3600 * 1000
        ).finally(() => {
            this.timeoutGC = window.setTimeout(
                () => this.gc(),
                this.frequencyGC
            );
        });
    }
}

export const statsdbGC = new StatsDBGC();
