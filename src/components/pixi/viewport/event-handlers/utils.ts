/* eslint-disable no-underscore-dangle */
import {
    CachedViewportPosition,
    CachedViewportStoreClass,
    CachedViewportZoom,
} from "@/lib/stores/CachedViewport";
import { Viewport as PixiViewport } from "pixi-viewport";
import { FederatedPointerEvent } from "pixi.js";
import { MarkingsStoreClass } from "@/lib/stores/Markings";
import { DashboardToolbarStore } from "@/lib/stores/DashboardToolbar";
import { MARKING_TYPE, MarkingBase } from "@/lib/markings/MarkingBase";
import { PointMarking } from "@/lib/markings/PointMarking";
import { RayMarking } from "@/lib/markings/RayMarking";
import { getNormalizedPosition } from "../../overlays/utils/get-viewport-local-position";
import { CanvasMetadata } from "../../canvas/hooks/useCanvasContext";

export type ViewportHandlerParams = {
    viewport: PixiViewport;
    id: CanvasMetadata["id"];
    updateViewport: () => void;
    cachedViewportStore: CachedViewportStoreClass;
    markingsStore: MarkingsStoreClass;
};

export type Delta = CachedViewportZoom | CachedViewportPosition | null;

export function updateCachedViewportStore(params: ViewportHandlerParams) {
    const { cachedViewportStore: store, viewport } = params;
    store.actions.viewport.setScaled(viewport.scaled);
    store.actions.viewport.setPosition({
        x: viewport.position._x,
        y: viewport.position._y,
    });
}

export function getNormalizedMousePosition(
    event: FederatedPointerEvent,
    viewport: PixiViewport
): CachedViewportPosition {
    return getNormalizedPosition(viewport, {
        x: event.screenX,
        y: event.screenY,
    });
}

export function addMarkingToStore(
    newMarking: MarkingBase,
    params: ViewportHandlerParams
) {
    const { markingsStore } = params;
    const { size, backgroundColor, textColor } =
        DashboardToolbarStore.state.settings.marking;

    if (newMarking.type === MARKING_TYPE.POINT) {
        markingsStore.actions.markings.addOne(
            new PointMarking(
                newMarking.label,
                newMarking.origin,
                backgroundColor,
                textColor,
                size,
                newMarking.boundMarkingId
            )
        );
    } else if (newMarking.type === MARKING_TYPE.RAY) {
        markingsStore.actions.markings.addOne(
            new RayMarking(
                newMarking.label,
                newMarking.origin,
                backgroundColor,
                textColor,
                size,
                (newMarking as RayMarking).angleRad ?? 0,
                newMarking.boundMarkingId
            )
        );
    } else {
        throw new Error("Unknown marking type");
    }
}
