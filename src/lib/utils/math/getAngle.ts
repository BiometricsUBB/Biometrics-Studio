import { Point } from "@/lib/markings/Point";

export const getAngle = (pos1: Point, pos2: Point) => {
    const unboundAngle =
        Math.atan2(pos2.y - pos1.y, pos2.x - pos1.x) + Math.PI / 2;
    return Math.atan2(Math.sin(unboundAngle), Math.cos(unboundAngle));
};
