import {
    MARKING_TYPE,
    MarkingBase,
    Position,
} from "@/lib/markings/MarkingBase";
import { ColorSource } from "pixi.js";
import { immerable } from "immer";

export class PointMarking implements MarkingBase {
    [immerable] = true;

    readonly type = MARKING_TYPE.POINT;

    constructor(
        public id: string,
        public label: number,
        public origin: Position,
        public hidden: boolean,
        public visible: boolean,
        public backgroundColor: ColorSource,
        public textColor: ColorSource,
        public size: number,
        public boundMarkingId: string
    ) {
        this.id = id;
        this.label = label;
        this.origin = origin;
        this.hidden = hidden;
        this.visible = visible;
        this.backgroundColor = backgroundColor;
        this.textColor = textColor;
        this.size = size;
        this.boundMarkingId = boundMarkingId;
    }
}
