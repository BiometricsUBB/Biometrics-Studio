import { ColorSource } from "pixi.js";
import { MARKING_TYPE } from "@/lib/markings/MarkingBase";

// TODO docelowo to powinno być dodane przez Marcela w https://github.com/BiometricsUBB/Biometrics-Studio/pull/6 wtedy należy to przepiąć
export enum WORKING_MODE {
    FINGERPRINT = "FINGERPRINT",
    EAR = "EAR",
    SHOEPRINT = "SHOEPRINT",
}

export interface MarkingCharacteristic {
    id: string;
    name: string;
    type: MARKING_TYPE;
    style: {
        backgroundColor: ColorSource;
        textColor: ColorSource;
        size: number;
    };
    // Metadane będą potrzebne już przy pracy w kontekstach np. odciski palców, butów etc
    metadata: {
        category: WORKING_MODE;
    };
}
