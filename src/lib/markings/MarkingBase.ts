import { Rectangle } from "pixi.js";
import { immerable } from "immer";
import {
    GlobalSettingsStore,
    PRERENDER_RADIUS_OPTIONS,
} from "@/lib/stores/GlobalSettings";
// eslint-disable-next-line import/no-cycle
import { MarkingsStore } from "@/lib/stores/Markings";
import { CANVAS_ID } from "@/components/pixi/canvas/hooks/useCanvasContext";

/* eslint-disable no-param-reassign */

export const enum MARKING_TYPE {
    POINT = "point",
    RAY = "ray",
    LINE_SEGMENT = "line_segment",
}

export interface Point {
    x: number;
    y: number;
}

export abstract class MarkingBase {
    [immerable] = true;

    public abstract readonly type: MARKING_TYPE;

    public readonly id: string = crypto.randomUUID();

    protected constructor(
        public label: number,
        public origin: Point,
        public characteristicId: string
    ) {
        this.label = label;
        this.origin = origin;
        this.characteristicId = characteristicId;
    }

    protected getPrerenderMargin() {
        enum PRERENDER_RADIUS_VALUES {
            NONE = 0,
            LOW = 200,
            MEDIUM = 500,
            HIGH = 900,
            VERY_HIGH = 1200,
        }

        const markingsLength =
            MarkingsStore(CANVAS_ID.LEFT).state.markings.length +
            MarkingsStore(CANVAS_ID.RIGHT).state.markings.length;

        switch (
            GlobalSettingsStore.state.settings.video.rendering.prerenderRadius
        ) {
            case PRERENDER_RADIUS_OPTIONS.AUTO:
                if (markingsLength < 100)
                    return 2 * PRERENDER_RADIUS_VALUES.VERY_HIGH;
                if (markingsLength < 200)
                    return PRERENDER_RADIUS_VALUES.VERY_HIGH;
                if (markingsLength < 500) return PRERENDER_RADIUS_VALUES.HIGH;
                if (markingsLength < 1000)
                    return PRERENDER_RADIUS_VALUES.MEDIUM;
                return PRERENDER_RADIUS_VALUES.LOW;
            case PRERENDER_RADIUS_OPTIONS.NONE:
                return PRERENDER_RADIUS_VALUES.NONE;
            case PRERENDER_RADIUS_OPTIONS.LOW:
                return PRERENDER_RADIUS_VALUES.LOW;
            case PRERENDER_RADIUS_OPTIONS.MEDIUM:
                return PRERENDER_RADIUS_VALUES.MEDIUM;
            case PRERENDER_RADIUS_OPTIONS.HIGH:
                return PRERENDER_RADIUS_VALUES.HIGH;
            case PRERENDER_RADIUS_OPTIONS.VERY_HIGH:
                return PRERENDER_RADIUS_VALUES.VERY_HIGH;
            default:
                return PRERENDER_RADIUS_VALUES.HIGH;
        }
    }

    public isVisible(
        screen: Rectangle,
        viewportPosition: Point,
        viewportWidthRatio: number,
        viewportHeightRatio: number
    ): boolean {
        const { x, y } = this.calculateOriginViewportPosition(
            viewportWidthRatio,
            viewportHeightRatio
        );
        if (x + viewportPosition.x < screen.left - this.getPrerenderMargin())
            return false;
        if (y + viewportPosition.y < screen.top - this.getPrerenderMargin())
            return false;
        if (x + viewportPosition.x > screen.right + this.getPrerenderMargin())
            return false;
        return !(
            y + viewportPosition.y >
            screen.bottom + this.getPrerenderMargin()
        );
    }

    public calculateOriginViewportPosition(
        viewportWidthRatio: number,
        viewportHeightRatio: number
    ): Point {
        return {
            x: this.origin.x * viewportWidthRatio,
            y: this.origin.y * viewportHeightRatio,
        };
    }
}
