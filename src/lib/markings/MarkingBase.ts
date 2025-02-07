import { immerable } from "immer";

/* eslint-disable no-param-reassign */

export enum MARKING_CLASS {
    POINT = "point",
    RAY = "ray",
    LINE_SEGMENT = "line_segment",
    BOUNDING_BOX = "bounding_box",
}

export interface Point {
    x: number;
    y: number;
}

export abstract class MarkingBase {
    [immerable] = true;

    public abstract readonly markingClass: MARKING_CLASS;

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
