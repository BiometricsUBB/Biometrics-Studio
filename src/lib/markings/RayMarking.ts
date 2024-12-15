// eslint-disable-next-line import/no-cycle
import { MarkingBase, MARKING_TYPE, Point } from "@/lib/markings/MarkingBase";
import { ColorSource } from "pixi.js";

export class RayMarking extends MarkingBase {
    readonly type = MARKING_TYPE.RAY;

    public angleRad: number;

    constructor(
        label: number,
        origin: Point,
        backgroundColor: ColorSource,
        textColor: ColorSource,
        size: number,
        angleRad: number,
        boundMarkingId: string | undefined = undefined
    ) {
        super(label, origin, backgroundColor, textColor, size, boundMarkingId);
        this.angleRad = angleRad;
    }
}
