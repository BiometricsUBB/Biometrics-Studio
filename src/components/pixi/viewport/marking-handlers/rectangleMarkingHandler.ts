// eslint-disable-next-line import/no-cycle
import { MarkingHandler } from "@/components/pixi/viewport/marking-handlers/markingHandler";
import { FederatedPointerEvent } from "pixi.js";
import { RectangleMarking } from "@/lib/markings/RectangleMarking";
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

export class RectangleMarkingHandler extends MarkingHandler {
    private origin: Point | null = null;

    private canvasId: CANVAS_ID;

    constructor(
        plugin: MarkingModePlugin,
        typeId: string,
        startEvent: FederatedPointerEvent
    ) {
        super(plugin, typeId, startEvent);
        this.canvasId = plugin.handlerParams.id;
        this.initOrigin(startEvent);
    }

    private getAdjustedPosition(pos: Point): Point {
        const { rotation } = RotationStore(this.canvasId).state;
        return transformPoint(pos, -rotation, 0, 0);
    }

    private initOrigin(e: FederatedPointerEvent) {
        const { viewport, markingsStore } = this.plugin.handlerParams;
        const label = markingsStore.actions.labelGenerator.getLabel();
        const pos = getNormalizedMousePosition(e, viewport);
        this.origin = pos;
        const { rotation } = RotationStore(this.canvasId).state;
        const worldPos = transformPoint(pos, -rotation, 0, 0);
        markingsStore.actions.temporaryMarking.setTemporaryMarking(
            new RectangleMarking(label, worldPos, this.typeId, [
                worldPos,
                worldPos,
                worldPos,
                worldPos,
            ])
        );
    }

    handleMouseMove(e: FederatedPointerEvent) {
        if (!this.origin) return;
        const { viewport, markingsStore } = this.plugin.handlerParams;
        const pos = getNormalizedMousePosition(e, viewport);
        const { rotation } = RotationStore(this.canvasId).state;
        const screenPoints: Point[] = [
            this.origin,
            { x: this.origin.x, y: pos.y },
            pos,
            { x: pos.x, y: this.origin.y },
        ];
        const worldPoints = screenPoints.map(p =>
            transformPoint(p, -rotation, 0, 0)
        );
        markingsStore.actions.temporaryMarking.updateTemporaryMarking({
            points: worldPoints,
        });
    }

    handleLMBUp(e: FederatedPointerEvent) {
        const { cachedViewportStore } = this.plugin.handlerParams;
        cachedViewportStore.actions.viewport.setRayPosition(
            getNormalizedMousePosition(e, this.plugin.handlerParams.viewport)
        );
    }

    handleLMBDown(e: FederatedPointerEvent) {
        if (!this.origin) return;
        const { viewport, markingsStore } = this.plugin.handlerParams;
        const endpoint = getNormalizedMousePosition(e, viewport);

        const adjustedOrigin = this.getAdjustedPosition(this.origin);
        const adjustedEndpoint = this.getAdjustedPosition(endpoint);
        const points: Point[] = [
            adjustedOrigin,
            this.getAdjustedPosition({ x: this.origin.x, y: endpoint.y }),
            adjustedEndpoint,
            this.getAdjustedPosition({ x: endpoint.x, y: this.origin.y }),
        ];

        markingsStore.actions.markings.addOne(
            new RectangleMarking(
                markingsStore.state.temporaryMarking!.label,
                adjustedOrigin,
                markingsStore.state.temporaryMarking!.typeId,
                points
            )
        );
        this.cleanup();
    }
}
