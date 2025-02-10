import { MarkingClass } from "@/lib/markings/MarkingClass";
import { MARKING_CLASS } from "@/lib/markings/MARKING_CLASS";
import { MarkingType } from "@/lib/markings/MarkingType";

export class PointMarking extends MarkingClass {
    readonly markingClass = MARKING_CLASS.POINT;

    // eslint-disable-next-line no-useless-constructor
    constructor(
        label: MarkingClass["label"],
        origin: MarkingClass["origin"],
        typeId: MarkingType["id"]
    ) {
        super(label, origin, typeId);
    }
}
