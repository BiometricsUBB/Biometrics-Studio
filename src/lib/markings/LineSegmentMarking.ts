// eslint-disable-next-line import/no-cycle
import { MarkingBase, MARKING_TYPE, Point } from "@/lib/markings/MarkingBase";
import { ColorSource, Rectangle } from "pixi.js";

export class LineSegmentMarking extends MarkingBase {
    readonly type = MARKING_TYPE.LINE_SEGMENT;

    constructor(
        label: number,
        origin: Point,
        backgroundColor: ColorSource,
        textColor: ColorSource,
        size: number,
        public endpoint: Point
    ) {
        super(label, origin, backgroundColor, textColor, size);
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

        // Offset coordinates by viewport position
        const ax = x1 + viewportPosition.x;
        const ay = y1 + viewportPosition.y;
        const bx = x2 + viewportPosition.x;
        const by = y2 + viewportPosition.y;

        // Step 1: Check if either the origin or endpoint is within the screen bounds
        if (
            this.isPointInBounds(ax, ay, screen) ||
            this.isPointInBounds(bx, by, screen)
        ) {
            return true;
        }

        // Step 2: If not, check if the line intersects any edge of the screen (bounding rectangle)
        return this.lineIntersectsRectangle(ax, ay, bx, by, screen);
    }

    // Function to check if a point is within the bounds of the rectangle (screen)
    private isPointInBounds(x: number, y: number, screen: Rectangle): boolean {
        return (
            x >= screen.left - this.getPrerenderMargin() &&
            x <= screen.right + this.getPrerenderMargin() &&
            y >= screen.top - this.getPrerenderMargin() &&
            y <= screen.bottom + this.getPrerenderMargin()
        );
    }

    // Function to check if a line segment intersects a rectangle
    private lineIntersectsRectangle(
        ax: number,
        ay: number,
        bx: number,
        by: number,
        rect: Rectangle
    ): boolean {
        // Check if line intersects the four edges of the rectangle
        return (
            this.isLineIntersectingEdge(
                ax,
                ay,
                bx,
                by,
                rect.left,
                rect.top,
                rect.left,
                rect.bottom
            ) || // Left edge
            this.isLineIntersectingEdge(
                ax,
                ay,
                bx,
                by,
                rect.right,
                rect.top,
                rect.right,
                rect.bottom
            ) || // Right edge
            this.isLineIntersectingEdge(
                ax,
                ay,
                bx,
                by,
                rect.left,
                rect.top,
                rect.right,
                rect.top
            ) || // Top edge
            this.isLineIntersectingEdge(
                ax,
                ay,
                bx,
                by,
                rect.left,
                rect.bottom,
                rect.right,
                rect.bottom
            )
        ); // Bottom edge
    }

    // Check if a line intersects with a rectangle edge
    private isLineIntersectingEdge(
        ax: number,
        ay: number,
        bx: number,
        by: number,
        x1: number,
        y1: number,
        x2: number,
        y2: number
    ): boolean {
        const denominator = (bx - ax) * (y2 - y1) - (by - ay) * (x2 - x1);

        if (denominator === 0) return false; // Lines are parallel

        const ua =
            ((bx - ax) * (ay - y1) - (by - ay) * (ax - x1)) / denominator;
        const ub =
            ((x2 - x1) * (ay - y1) - (y2 - y1) * (ax - x1)) / denominator;

        // Check if the intersection point is within both line segments
        return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
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
