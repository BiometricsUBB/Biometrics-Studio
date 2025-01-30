// eslint-disable-next-line import/no-cycle
import { MarkingHandler } from "@/components/pixi/viewport/marking-handlers/markingHandler";
import { FederatedPointerEvent } from "pixi.js";
import { BoundingBoxMarking } from "@/lib/markings/BoundingBoxMarking";
import { getNormalizedMousePosition } from "@/components/pixi/viewport/event-handlers/utils";
import { MarkingModePlugin } from "@/components/pixi/viewport/plugins/markingModePlugin";

export class BoundingBoxMarkingHandler extends MarkingHandler {
    constructor(
        plugin: MarkingModePlugin,
        characteristicId: string,
        startEvent: FederatedPointerEvent
    ) {
        super(plugin, characteristicId, startEvent);
        this.initMarking(startEvent);
    }

    private initMarking(e: FederatedPointerEvent) {
        const { viewport, markingsStore } = this.plugin.handlerParams;
        markingsStore.actions.temporaryMarking.setTemporaryMarking(
            new BoundingBoxMarking(
                markingsStore.actions.labelGenerator.getLabel(),
                getNormalizedMousePosition(e, viewport),
                this.characteristicId,
                getNormalizedMousePosition(e, viewport)
            )
        );
    }

    handleMouseMove(e: FederatedPointerEvent) {
        const { viewport, markingsStore } = this.plugin.handlerParams;
        markingsStore.actions.temporaryMarking.updateTemporaryMarking({
            endpoint: getNormalizedMousePosition(e, viewport),
        });
    }

    handleLMBUp(e: FederatedPointerEvent) {
        const { cachedViewportStore } = this.plugin.handlerParams;
        cachedViewportStore.actions.viewport.setRayPosition(
            getNormalizedMousePosition(e, this.plugin.handlerParams.viewport)
        );
    }

    handleLMBDown() {
        const { markingsStore } = this.plugin.handlerParams;
        markingsStore.actions.markings.addOne(
            markingsStore.state.temporaryMarking as BoundingBoxMarking
        );
        this.cleanup();
    }
}
