// eslint-disable-next-line import/no-cycle
import { MarkingBase, MARKING_CLASS, Point } from "@/lib/markings/MarkingBase";

export class BoundingBoxMarking extends MarkingBase {
    readonly markingClass = MARKING_CLASS.BOUNDING_BOX;

    constructor(
        label: number,
        origin: Point,
        characteristicId: string,
        public endpoint: Point
    ) {
        super(label, origin, characteristicId);
        this.endpoint = endpoint;
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
