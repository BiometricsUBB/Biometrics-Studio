// eslint-disable-next-line import/no-cycle
import { MarkingHandler } from "@/components/pixi/viewport/marking-handlers/markingHandler";
import { FederatedPointerEvent } from "pixi.js";
import { RayMarking } from "@/lib/markings/RayMarking";
import { getNormalizedMousePosition } from "@/components/pixi/viewport/event-handlers/utils";
import { getAngle } from "@/lib/utils/math/getAngle";
import { MarkingModePlugin } from "@/components/pixi/viewport/plugins/markingModePlugin";

export class RayMarkingHandler extends MarkingHandler {
    private stage: 1 | 2 = 1;

    constructor(
        plugin: MarkingModePlugin,
        typeId: string,
        startEvent: FederatedPointerEvent
    ) {
        super(plugin, typeId, startEvent);
        this.initFirstStage(startEvent);
    }

    private initFirstStage(e: FederatedPointerEvent) {
        const { viewport, markingsStore } = this.plugin.handlerParams;
        markingsStore.actions.temporaryMarking.setTemporaryMarking(
            new RayMarking(
                markingsStore.actions.labelGenerator.getLabel(),
                getNormalizedMousePosition(e, viewport),
                this.typeId,
                0
            )
        );
    }

    handleMouseMove(e: FederatedPointerEvent) {
        const { viewport, markingsStore, cachedViewportStore } =
            this.plugin.handlerParams;

        if (this.stage === 1) {
            markingsStore.actions.temporaryMarking.updateTemporaryMarking({
                origin: getNormalizedMousePosition(e, viewport),
            });
        } else {
            markingsStore.actions.temporaryMarking.updateTemporaryMarking({
                angleRad: getAngle(
                    getNormalizedMousePosition(e, viewport),
                    cachedViewportStore.state.rayPosition
                ),
            });
        }
    }

    handleLMBUp(e: FederatedPointerEvent) {
        const { cachedViewportStore } = this.plugin.handlerParams;

        if (this.stage === 1) {
            this.stage = 2;
            cachedViewportStore.actions.viewport.setRayPosition(
                getNormalizedMousePosition(
                    e,
                    this.plugin.handlerParams.viewport
                )
            );
        }
    }

    handleLMBDown() {
        if (this.stage === 2) {
            const { markingsStore } = this.plugin.handlerParams;
            markingsStore.actions.markings.addOne(
                markingsStore.state.temporaryMarking as RayMarking
            );
            this.cleanup();
        }
    }
}
