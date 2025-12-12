import { Viewport } from "pixi-viewport";
import { Sprite } from "pixi.js";
import { Point } from "@/lib/markings/Point";

export type FitEvent = {
    viewport: Viewport;
    type: "fit-height" | "fit-width" | "fit-world";
    original?: Point;
};

export const emitFitEvents = (
    viewport: Viewport | null,
    type: FitEvent["type"]
) => {
    viewport?.emit("moved", {
        // @ts-expect-error - fitWorld is not in the type
        type,
        viewport,
    });

    viewport?.emit("zoomed", {
        type: "wheel",
        viewport,
    });
};

export const fitHeight = (viewport: Viewport | null) => {
    if (!viewport) return;
    viewport.fitHeight();

    const sprite = viewport.children.find(x => x instanceof Sprite) as
        | Sprite
        | undefined;
    if (sprite) {
        viewport.moveCorner(-sprite.pivot.x, 0);
    } else {
        viewport.moveCorner(0, 0);
    }
};

export const fitWidth = (viewport: Viewport | null) => {
    if (!viewport) return;
    viewport.fitWidth();

    const sprite = viewport.children.find(x => x instanceof Sprite) as
        | Sprite
        | undefined;
    if (sprite) {
        viewport.moveCorner(0, -sprite.pivot.y);
    } else {
        viewport.moveCorner(0, 0);
    }
};

export const fitWorld = (viewport: Viewport | null) => {
    if (!viewport) return;
    viewport.fitWorld();

    const sprite = viewport.children.find(x => x instanceof Sprite) as
        | Sprite
        | undefined;
    if (sprite) {
        viewport.moveCenter(sprite.position.x, sprite.position.y);
    } else {
        viewport.moveCenter(0, 0);
    }
};
