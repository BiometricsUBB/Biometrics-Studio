// eslint-disable-next-line import/no-cycle
import { MarkingBase, MARKING_TYPE, Point } from "@/lib/markings/MarkingBase";
import { ColorSource } from "pixi.js";

export class PointMarking extends MarkingBase {
    readonly type = MARKING_TYPE.POINT;

    // eslint-disable-next-line no-useless-constructor
    constructor(
        label: number,
        origin: Point,
        backgroundColor: ColorSource,
        textColor: ColorSource,
        size: number
    ) {
        super(label, origin, backgroundColor, textColor, size);
    }
}
