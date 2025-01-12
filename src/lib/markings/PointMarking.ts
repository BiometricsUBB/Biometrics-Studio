// eslint-disable-next-line import/no-cycle
import { MarkingBase, MARKING_TYPE, Point } from "@/lib/markings/MarkingBase";

export class PointMarking extends MarkingBase {
    readonly type = MARKING_TYPE.POINT;

    // eslint-disable-next-line no-useless-constructor
    constructor(label: number, origin: Point, characteristicId: string) {
        super(label, origin, characteristicId);
    }
}
