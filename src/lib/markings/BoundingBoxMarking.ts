// eslint-disable-next-line import/no-cycle
import { MarkingBase, MARKING_CLASS, Point } from "@/lib/markings/MarkingBase";
import { Rectangle } from "pixi.js";

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

    public override isVisible(
        screen: Rectangle,
        viewportPosition: Point,
        viewportWidthRatio: number,
        viewportHeightRatio: number
    ): boolean {
        const { x: x1, y: y1 } = this.calculateOriginViewportPosition(
            viewportWidthRatio,
            viewportHeightRatio
        );

        const { x: x2, y: y2 } = this.calculateEndpointViewportPosition(
            viewportWidthRatio,
            viewportHeightRatio
        );

        const ax = x1 + viewportPosition.x;
        const ay = y1 + viewportPosition.y;
        const bx = x2 + viewportPosition.x;
        const by = y2 + viewportPosition.y;

        const boundingBox = new Rectangle(
            Math.min(ax, bx),
            Math.min(ay, by),
            Math.abs(bx - ax),
            Math.abs(by - ay)
        );

        return this.rectanglesIntersect(boundingBox, screen);
    }

    private rectanglesIntersect(rect1: Rectangle, rect2: Rectangle): boolean {
        return !(
            rect1.right < rect2.left ||
            rect1.left > rect2.right ||
            rect1.bottom < rect2.top ||
            rect1.top > rect2.bottom
        );
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
