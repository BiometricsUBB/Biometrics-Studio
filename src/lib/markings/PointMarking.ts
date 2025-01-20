// eslint-disable-next-line import/no-cycle
import { MarkingBase, MARKING_CLASS, Point } from "@/lib/markings/MarkingBase";

export class PointMarking extends MarkingBase {
    readonly markingClass = MARKING_CLASS.POINT;

    // eslint-disable-next-line no-useless-constructor
    constructor(label: number, origin: Point, characteristicId: string) {
        super(label, origin, characteristicId);
    }
}
