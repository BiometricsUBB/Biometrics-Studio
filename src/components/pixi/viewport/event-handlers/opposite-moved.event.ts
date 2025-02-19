import { MovedEvent } from "pixi-viewport/dist/types";
import {
    CachedViewportPosition,
    CachedViewportZoom,
} from "@/lib/stores/CachedViewport";
import {
    FitEvent,
    fitHeight,
    fitWidth,
    fitWorld,
} from "@/components/pixi/canvas/utils/fit-viewport";
import {
    Delta,
    ViewportHandlerParams,
    updateCachedViewportStore,
} from "./utils";

export const handleOppositeMove = (
    event: MovedEvent | FitEvent,
    params: ViewportHandlerParams,
    delta: Delta
) => {
    const { viewport, cachedViewportStore: store, updateViewport } = params;
    switch (event.type) {
        case "drag": {
            const { x, y } = delta as CachedViewportPosition;
            viewport.moveCorner(viewport.corner.x - x, viewport.corner.y - y);
            break;
        }
        case "wheel": {
            const { value } = delta as CachedViewportZoom;

            const newScale = viewport.scaled * value;

            if (newScale !== store.state.oppositeScaled) {
                viewport.setZoom(newScale, true);
            }

            viewport.emit("zoomed", {
                type: "wheel",
                viewport,
            });

            store.actions.viewport.opposite.setScaled(newScale);
            break;
        }
        case "fit-height": {
            fitHeight(viewport);
            viewport?.emit("zoomed", {
                type: "wheel",
                viewport,
            });
            break;
        }
        case "fit-width": {
            fitWidth(viewport);
            viewport?.emit("zoomed", {
                type: "wheel",
                viewport,
            });
            break;
        }
        case "fit-world": {
            fitWorld(viewport);
            viewport?.emit("zoomed", {
                type: "wheel",
                viewport,
            });
            break;
        }
        default: {
            break;
        }
    }

    updateViewport();
    updateCachedViewportStore(params);
};
