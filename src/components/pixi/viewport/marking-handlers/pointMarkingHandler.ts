// eslint-disable-next-line import/no-cycle
import { MarkingHandler } from "@/components/pixi/viewport/marking-handlers/markingHandler";
import { FederatedPointerEvent } from "pixi.js";
import { PointMarking } from "@/lib/markings/PointMarking";
import { getNormalizedMousePosition } from "@/components/pixi/viewport/event-handlers/utils";
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

export class PointMarkingHandler extends MarkingHandler {
    private canvasId: CANVAS_ID;

    constructor(
        plugin: MarkingModePlugin,
        typeId: string,
        startEvent: FederatedPointerEvent
    ) {
        super(plugin, typeId, startEvent);
        this.canvasId = plugin.handlerParams.id;
        this.initMarking(startEvent);
    }

    private getAdjustedPosition(pos: Point): Point {
        const { rotation } = RotationStore(this.canvasId).state;
        return transformPoint(pos, -rotation, 0, 0);
    }

    private initMarking(e: FederatedPointerEvent) {
        const { viewport, markingsStore } = this.plugin.handlerParams;
        const label = markingsStore.actions.labelGenerator.getLabel();
        const pos = this.getAdjustedPosition(
            getNormalizedMousePosition(e, viewport)
        );
        markingsStore.actions.temporaryMarking.setTemporaryMarking(
            new PointMarking(label, pos, this.typeId)
        );
    }

    handleMouseMove(e: FederatedPointerEvent) {
        const { viewport, markingsStore } = this.plugin.handlerParams;
        const pos = this.getAdjustedPosition(
            getNormalizedMousePosition(e, viewport)
        );
        markingsStore.actions.temporaryMarking.updateTemporaryMarking({
            origin: pos,
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
