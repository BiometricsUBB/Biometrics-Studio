import { immerable } from "immer";
import { MarkingType } from "@/lib/markings/MarkingType";
import { MARKING_CLASS } from "@/lib/markings/MARKING_CLASS";
import { Point } from "@/lib/markings/Point";

export abstract class MarkingClass {
    [immerable] = true;

    public abstract readonly markingClass: MARKING_CLASS;

    public readonly id: string = crypto.randomUUID();

    protected constructor(
        public label: number,
        public origin: Point,
        public typeId: MarkingType["id"]
    ) {
        this.label = label;
        this.origin = origin;
        this.typeId = typeId;
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
