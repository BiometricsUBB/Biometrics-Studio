import { Plugin, Viewport } from "pixi-viewport";
import { FederatedPointerEvent } from "pixi.js";
import {
    CURSOR_MODES,
    DashboardToolbarStore,
} from "@/lib/stores/DashboardToolbar";
import { CUSTOM_GLOBAL_EVENTS } from "@/lib/utils/const";
import { LineSegmentMarking } from "@/lib/markings/LineSegmentMarking";
import { AutoRotateStore } from "@/lib/stores/AutoRotate/AutoRotate";
import { CachedViewportStore } from "@/lib/stores/CachedViewport";
import { MarkingTypesStore } from "@/lib/stores/MarkingTypes/MarkingTypes";
import { RotationStore } from "@/lib/stores/Rotation/Rotation";
import { CANVAS_ID } from "../../canvas/hooks/useCanvasContext";
import { getNormalizedMousePosition } from "../event-handlers/utils";
import { getAdjustedPosition } from "../utils/transform-point";

export class AutoRotatePlugin extends Plugin {
    private viewport: Viewport;

    private canvasId: CANVAS_ID;

    private tempLine: LineSegmentMarking | null = null;

    private stage: 1 | 2 = 1;

    constructor(viewport: Viewport, canvasId: CANVAS_ID) {
        super(viewport);
        this.viewport = viewport;
        this.canvasId = canvasId;

        this.viewport.on("mousedown", this.handleMouseDown);
    }

    public override destroy(): void {
        super.destroy();
        this.removeEventListeners();
    }

    public cleanup() {
        this.removeEventListeners();
        this.tempLine = null;
        this.stage = 1;
        AutoRotateStore.actions.setTempLine(this.canvasId, null);
        AutoRotateStore.actions.setFinishedLine(this.canvasId, null);
    }

    private isAutoRotateModeActive(): boolean {
        return (
            DashboardToolbarStore.state.settings.cursor.mode ===
            CURSOR_MODES.AUTOROTATE
        );
    }

    private handleMouseDown = (e: FederatedPointerEvent): void => {
        if (this.isAutoRotateModeActive() && e.button === 0) {
            if (this.stage === 1) {
                this.startDrawing(e);
            } else if (this.stage === 2) {
                this.finishDrawing();
            }
        }
    };

    private startDrawing(e: FederatedPointerEvent): void {
        if (this.viewport.children.length < 1) return;

        document.addEventListener(
            CUSTOM_GLOBAL_EVENTS.INTERRUPT_MARKING,
            this.handleInterrupt
        );

        const typeId = MarkingTypesStore.state.types[0]?.id || "";
        const { rotation } = RotationStore(this.canvasId).state;
        const pos = getAdjustedPosition(
            getNormalizedMousePosition(e, this.viewport),
            rotation,
            this.viewport
        );

        this.tempLine = new LineSegmentMarking(
            0, // dummy label
            pos,
            typeId,
            pos
        );

        AutoRotateStore.actions.setTempLine(this.canvasId, this.tempLine);

        this.addEventListeners();
    }

    private handleInterrupt = () => {
        this.cleanup();
    };

    private addEventListeners(): void {
        this.viewport.on("mousemove", this.handleMouseMove);
        this.viewport.on("mouseup", this.handleLMBUp);
    }

    private removeEventListeners(): void {
        this.viewport.off("mousemove", this.handleMouseMove);
        this.viewport.off("mouseup", this.handleLMBUp);
        document.removeEventListener(
            CUSTOM_GLOBAL_EVENTS.INTERRUPT_MARKING,
            this.handleInterrupt
        );
    }

    private handleMouseMove = (e: FederatedPointerEvent): void => {
        if (!this.isAutoRotateModeActive() || !this.tempLine) return;

        const { rotation } = RotationStore(this.canvasId).state;
        const pos = getAdjustedPosition(
            getNormalizedMousePosition(e, this.viewport),
            rotation,
            this.viewport
        );

        if (this.stage === 1) {
            this.tempLine = new LineSegmentMarking(
                this.tempLine.label,
                pos,
                this.tempLine.typeId,
                this.tempLine.endpoint
            );
        } else {
            this.tempLine = new LineSegmentMarking(
                this.tempLine.label,
                this.tempLine.origin,
                this.tempLine.typeId,
                pos
            );
        }
        AutoRotateStore.actions.setTempLine(this.canvasId, this.tempLine);
    };

    private handleLMBUp = (): void => {
        if (!this.isAutoRotateModeActive() || !this.tempLine) return;

        if (this.stage === 1) {
            this.stage = 2;
            CachedViewportStore(this.canvasId).actions.viewport.setRayPosition(
                this.tempLine.endpoint
            );
        }
    };

    private finishDrawing(): void {
        if (this.tempLine) {
            CachedViewportStore(this.canvasId).actions.viewport.setRayPosition(
                this.tempLine.endpoint
            );

            AutoRotateStore.actions.setFinishedLine(
                this.canvasId,
                this.tempLine
            );

            this.stage = 1;
            this.removeEventListeners();
        }
    }
}
