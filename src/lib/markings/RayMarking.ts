// eslint-disable-next-line import/no-cycle
import { MarkingBase, MARKING_TYPE, Point } from "@/lib/markings/MarkingBase";

export class RayMarking extends MarkingBase {
    readonly type = MARKING_TYPE.RAY;

    constructor(
        label: number,
        origin: Point,
        characteristicId: string,
        public angleRad: number
    ) {
        super(label, origin, characteristicId);
        this.angleRad = angleRad;
    }
}
