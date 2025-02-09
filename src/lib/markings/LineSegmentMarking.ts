import { MarkingClass } from "@/lib/markings/MarkingClass";
import { MARKING_CLASS } from "@/lib/markings/MARKING_CLASS";
import { Point } from "@/lib/markings/Point";

export class LineSegmentMarking extends MarkingClass {
    readonly markingClass = MARKING_CLASS.LINE_SEGMENT;

    constructor(
        label: MarkingClass["label"],
        origin: MarkingClass["origin"],
        typeId: MarkingClass["typeId"],
        public endpoint: Point
    ) {
        super(label, origin, typeId);
    }

    public calculateEndpointViewportPosition(
        viewportWidthRatio: number,
        viewportHeightRatio: number
    ): Point {
        return {
            x: this.endpoint.x * viewportWidthRatio,
            y: this.endpoint.y * viewportHeightRatio,
        };
    }
}
