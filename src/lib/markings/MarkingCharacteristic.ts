import { ColorSource } from "pixi.js";
import { MARKING_CLASS } from "@/lib/markings/MarkingBase";
import { WORKING_MODE } from "@/views/selectMode";

export interface MarkingCharacteristic {
    id: string;
    displayName: string;
    characteristicName: string;
    markingClass: MARKING_CLASS;
    backgroundColor: ColorSource;
    textColor: ColorSource;
    size: number;
    category: WORKING_MODE;
}

export const defaultBackgroundColor = "#61BD67";
export const defaultTextColor = "#0a130a";
export const defaultSize = 10;
