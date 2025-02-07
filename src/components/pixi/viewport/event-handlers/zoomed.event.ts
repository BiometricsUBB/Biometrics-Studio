import { ZoomedEvent } from "pixi-viewport/dist/types";
import { ShallowViewportStore } from "@/lib/stores/ShallowViewport";
import { ViewportHandlerParams } from "./utils";

export const handleZoom = (
    _event: ZoomedEvent,
    params: ViewportHandlerParams
) => {
    const { id, viewport } = params;

    // update shallow viewport store size
    const { setSize: setShallowViewportSize } =
        ShallowViewportStore(id).actions.size;

    setShallowViewportSize({
        screenWorldHeight: viewport.screenWorldHeight,
        screenWorldWidth: viewport.screenWorldWidth,
        worldHeight: viewport.worldHeight,
        worldWidth: viewport.worldWidth,
    });
};
