import { Point } from "@/lib/markings/Point";
import { Sprite } from "pixi.js";
import { Viewport } from "pixi-viewport";

export const transformPoint = (
    point: Point,
    rotation: number,
    centerX: number,
    centerY: number
): Point => {
    if (rotation === 0) return point;
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const x = point.x - centerX;
    const y = point.y - centerY;
    const rotatedX = x * cos - y * sin;
    const rotatedY = x * sin + y * cos;
    return {
        x: rotatedX + centerX,
        y: rotatedY + centerY,
    };
};

export const getImageCenter = (viewport: Viewport): Point => {
    const sprite = viewport.children.find(x => x instanceof Sprite) as
        | Sprite
        | undefined;
    return {
        x: sprite ? sprite.width / 2 : 0,
        y: sprite ? sprite.height / 2 : 0,
    };
};

export const getAdjustedPosition = (
    pos: Point,
    rotation: number,
    viewport: Viewport
): Point => {
    const center = getImageCenter(viewport);
    return transformPoint(pos, -rotation, center.x, center.y);
};
