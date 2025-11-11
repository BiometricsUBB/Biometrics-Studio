// eslint-disable-next-line import/no-cycle
import { MarkingHandler } from "@/components/pixi/viewport/marking-handlers/markingHandler";
import { FederatedPointerEvent } from "pixi.js";
import { RayMarking } from "@/lib/markings/RayMarking";
import { getNormalizedMousePosition } from "@/components/pixi/viewport/event-handlers/utils";
import { getAngle } from "@/lib/utils/math/getAngle";
import { MarkingModePlugin } from "@/components/pixi/viewport/plugins/markingModePlugin";
import { RotationStore } from "@/lib/stores/Rotation/Rotation";
import { CANVAS_ID } from "@/components/pixi/canvas/hooks/useCanvasContext";
import { Point } from "@/lib/markings/Point";

const transformPoint = (
    point: Point,
    rotation: number,
    centerX: number,
    centerY: number
): Point => {
    if (rotation === 0) return point;
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const x = point.x - centerX;
    const y = point.y - centerY;
    const rotatedX = x * cos - y * sin;
    const rotatedY = x * sin + y * cos;
    return {
        x: rotatedX + centerX,
        y: rotatedY + centerY,
    };
};

export class RayMarkingHandler extends MarkingHandler {
    private stage: 1 | 2 = 1;

    private canvasId: CANVAS_ID;

    constructor(
        plugin: MarkingModePlugin,
        typeId: string,
        startEvent: FederatedPointerEvent
    ) {
        super(plugin, typeId, startEvent);
        this.canvasId = plugin.handlerParams.id;
        this.initFirstStage(startEvent);
    }

    private getAdjustedPosition(pos: Point): Point {
        const { rotation } = RotationStore(this.canvasId).state;
        return transformPoint(pos, -rotation, 0, 0);
    }

    private initFirstStage(e: FederatedPointerEvent) {
        const { viewport, markingsStore } = this.plugin.handlerParams;
        const label = markingsStore.actions.labelGenerator.getLabel();
        const pos = this.getAdjustedPosition(
            getNormalizedMousePosition(e, viewport)
        );
        markingsStore.actions.temporaryMarking.setTemporaryMarking(
            new RayMarking(label, pos, this.typeId, 0)
        );
    }

    handleMouseMove(e: FederatedPointerEvent) {
        const { viewport, markingsStore, cachedViewportStore } =
            this.plugin.handlerParams;

        if (this.stage === 1) {
            const pos = this.getAdjustedPosition(
                getNormalizedMousePosition(e, viewport)
            );
            markingsStore.actions.temporaryMarking.updateTemporaryMarking({
                origin: pos,
            });
        } else {
            const mousePos = this.getAdjustedPosition(
                getNormalizedMousePosition(e, viewport)
            );
            markingsStore.actions.temporaryMarking.updateTemporaryMarking({
                angleRad: getAngle(
                    mousePos,
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
                this.getAdjustedPosition(
                    getNormalizedMousePosition(
                        e,
                        this.plugin.handlerParams.viewport
                    )
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
