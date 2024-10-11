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
import { isMarkingBase } from "@/components/information-tabs/markings-info/columns";
import { MARKING_TYPE, MarkingBase } from "@/lib/markings/MarkingBase";
import { RayMarking } from "@/lib/markings/RayMarking";
import { PointMarking } from "@/lib/markings/PointMarking";
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

// TODO: Do przerobienia, prawdopodobnie na dwie metody lub do usuniecia
export function createMarking(
    type: MarkingBase["type"],
    angleRad: number | null,
    origin: MarkingBase["origin"],
    label?: MarkingBase["label"]
): MarkingBase {
    const { size, backgroundColor, textColor } =
        DashboardToolbarStore.state.settings.marking;

    if (type === MARKING_TYPE.POINT) {
        return new PointMarking(
            "",
            label ?? -1,
            origin,
            false,
            true,
            backgroundColor,
            textColor,
            size,
            ""
        ) as MarkingBase;
    }

    if (type === MARKING_TYPE.RAY) {
        return new RayMarking(
            "",
            label ?? -1,
            origin,
            false,
            true,
            backgroundColor,
            textColor,
            size,
            "",
            angleRad!
        ) as MarkingBase;
    }

    throw new Error(`Unknown marking type: ${type}`);
}

export function addMarkingToStore(
    newMarking: MarkingBase,
    params: ViewportHandlerParams
) {
    const { markingsStore } = params;

    const { type: markingType, origin: markingPos, label } = newMarking;
    const { addOne: addMarking } = markingsStore.actions.markings;

    switch (markingType) {
        case MARKING_TYPE.POINT: {
            const marking = createMarking(markingType, null, markingPos, label);
            return addMarking(marking);
        }
        case MARKING_TYPE.RAY: {
            const marking = createMarking(
                markingType,
                (newMarking as RayMarking).angleRad,
                markingPos,
                label
            );
            return addMarking(marking);
        }
        default:
            markingType satisfies never;
            throw new Error(`Unknown marking type: ${markingType}`);
    }
}

export function addOrEditMarking(
    marking: MarkingBase,
    params: ViewportHandlerParams
) {
    const { markingsStore } = params;
    const { selectedMarking } = markingsStore.state;

    if (selectedMarking === null) {
        addMarkingToStore(marking, params);
        return;
    }

    if (isMarkingBase(selectedMarking)) {
        const { size, backgroundColor, textColor } =
            DashboardToolbarStore.state.settings.marking;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, label, ...newProps } = marking;

        markingsStore.actions.markings.editOneById(selectedMarking.id, {
            ...newProps,
            size,
            backgroundColor,
            textColor,
        });
        return;
    }

    const newMarking = addMarkingToStore(
        {
            ...marking,
            boundMarkingId: selectedMarking.boundMarkingId,
            label: selectedMarking.label,
        },
        params
    );
    markingsStore.actions.selectedMarking.setSelectedMarking(newMarking);
}
