// eslint-disable-next-line import/no-cycle
import { MarkingBase, MARKING_TYPE, Point } from "@/lib/markings/MarkingBase";
import { ColorSource } from "pixi.js";

export class PointMarking extends MarkingBase {
    readonly type = MARKING_TYPE.POINT;

    constructor(
        label: number,
        origin: Point,
        backgroundColor: ColorSource,
        textColor: ColorSource,
        size: number,
        boundMarkingId: string | undefined = undefined
    ) {
        super(label, origin, backgroundColor, textColor, size, boundMarkingId);
    }
}
