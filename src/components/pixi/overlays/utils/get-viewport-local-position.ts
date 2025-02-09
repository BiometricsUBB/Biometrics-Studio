import { Viewport } from "pixi-viewport";

import { Point } from "@/lib/markings/Point";

export const getViewportPosition = ({ position }: Viewport): Point => {
    return {
        x: position.x,
        y: position.y,
    };
};

export const getViewportGlobalPosition = ({ x, y }: Viewport): Point => {
    return { x, y };
};

export const getRelativePosition = (
    viewport: Viewport,
    { x, y }: Point
): Point => {
    return {
        x: x * (viewport.screenWorldWidth / viewport.worldWidth),
        y: y * (viewport.screenWorldHeight / viewport.worldHeight),
    };
};

export const getNormalizedPosition = (
    viewport: Viewport,
    { x, y }: Point
): Point => {
    const pos = getViewportPosition(viewport);
    return {
        x: (x - pos.x) / viewport.scaled,
        y: (y - pos.y) / viewport.scaled,
    };
};
