// eslint-disable-next-line import/no-cycle
import { MarkingHandler } from "@/components/pixi/viewport/marking-handlers/markingHandler";
import { FederatedPointerEvent } from "pixi.js";
import { PointMarking } from "@/lib/markings/PointMarking";
import { getNormalizedMousePosition } from "@/components/pixi/viewport/event-handlers/utils";
import { MarkingModePlugin } from "@/components/pixi/viewport/plugins/markingModePlugin";

export class PointMarkingHandler extends MarkingHandler {
    constructor(
        plugin: MarkingModePlugin,
        typeId: string,
        startEvent: FederatedPointerEvent
    ) {
        super(plugin, typeId, startEvent);
        this.initMarking(startEvent);
    }

    private initMarking(e: FederatedPointerEvent) {
        const { viewport, markingsStore } = this.plugin.handlerParams;
        const label = markingsStore.actions.labelGenerator.getLabel();
        markingsStore.actions.temporaryMarking.setTemporaryMarking(
            new PointMarking(
                label,
                getNormalizedMousePosition(e, viewport),
                this.typeId
            )
        );
    }

    handleMouseMove(e: FederatedPointerEvent) {
        const { viewport, markingsStore } = this.plugin.handlerParams;
        markingsStore.actions.temporaryMarking.updateTemporaryMarking({
            origin: getNormalizedMousePosition(e, viewport),
        });
    }

    override handleLMBDown?(): void {}

    handleLMBUp() {
        const { markingsStore } = this.plugin.handlerParams;
        markingsStore.actions.markings.addOne(
            markingsStore.state.temporaryMarking as PointMarking
        );
        this.cleanup();
    }
}
