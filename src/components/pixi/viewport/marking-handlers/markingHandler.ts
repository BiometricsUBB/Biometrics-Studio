import { FederatedPointerEvent } from "pixi.js";
// eslint-disable-next-line import/no-cycle
import { MarkingModePlugin } from "@/components/pixi/viewport/plugins/markingModePlugin";

export abstract class MarkingHandler {
    // eslint-disable-next-line no-useless-constructor
    constructor(
        protected plugin: MarkingModePlugin,
        protected characteristicId: string,
        protected startEvent: FederatedPointerEvent
        // eslint-disable-next-line no-empty-function
    ) {}

    abstract handleMouseMove(e: FederatedPointerEvent): void;

    abstract handleLMBUp(e: FederatedPointerEvent): void;

    abstract handleLMBDown?(e: FederatedPointerEvent): void;

    protected cleanup() {
        this.plugin.cleanup();
    }
}
