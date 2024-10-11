import { ColorSource } from "pixi.js";

export const enum MARKING_TYPE {
    POINT = "point",
    RAY = "ray",
}

export interface Position {
    x: number;
    y: number;
}

export interface MarkingBase {
    type: MARKING_TYPE;
    hidden: boolean; // todo borysk - dowiedzieć się po co property
    visible: boolean; // todo borysk - dowiedzieć się po co property
    id: string;
    label: number;
    origin: {
        x: number;
        y: number;
    };
    backgroundColor: ColorSource;
    textColor: ColorSource;
    size: number;
    boundMarkingId: MarkingBase["id"] | undefined;
}

// const markings: MarkingBase[] = [
//     new RayMarking(
//         "idray",
//         1,
//         { x: 1, y: 2 },
//         true,
//         true,
//         "red",
//         "black",
//         1,
//         10
//     ),
//     new PointMarking(
//         "idpoint",
//         1,
//         { x: 2, y: 3 },
//         true,
//         true,
//         "red",
//         "black",
//         1
//     ),
// ];
//
// const serialized = JSON.stringify(markings);
// console.log(serialized);
//
// function deserializeMarkings(plainData: string): MarkingBase[] {
//     const data: MarkingBase[] = JSON.parse(plainData);
//
//     return data.map(item => {
//         if (item.type === MARKING_TYPE.RAY) {
//             return new RayMarking(
//                 item.id,
//                 item.label,
//                 item.origin,
//                 item.hidden,
//                 item.visible,
//                 item.backgroundColor,
//                 item.textColor,
//                 item.size,
//                 (item as RayMarking).angleRad
//             );
//         }
//         if (item.type === MARKING_TYPE.POINT) {
//             return new PointMarking(
//                 item.id,
//                 item.label,
//                 item.origin,
//                 item.hidden,
//                 item.visible,
//                 item.backgroundColor,
//                 item.textColor,
//                 item.size
//             );
//         }
//         throw new Error(`Unknown marking type: ${item.type}`);
//     });
// }
//
// const deserialized = deserializeMarkings(serialized);
//
// deserialized.forEach(marking =>
//     console.log(
//         marking instanceof RayMarking || marking instanceof PointMarking
//     )
// );
//
// if (deserialized[0] instanceof RayMarking) {
//     console.log(deserialized[0].angleRad);
// }
