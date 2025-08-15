import { MarkingClass } from "@/lib/markings/MarkingClass";
import { MARKING_CLASS } from "@/lib/markings/MARKING_CLASS";
import { Point } from "@/lib/markings/Point";

export class BoundingBoxMarking extends MarkingClass {
    readonly markingClass = MARKING_CLASS.BOUNDING_BOX;

    constructor(
        label: MarkingClass["label"],
        origin: MarkingClass["origin"],
        typeId: MarkingClass["typeId"],
        public endpoint: Point,
        ids?: string[]
    ) {
        super(label, origin, typeId, ids);
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
