import { devtools } from "zustand/middleware";
import { create } from "zustand";
import { CanvasMetadata } from "@/components/pixi/canvas/hooks/useCanvasContext";
import { Immer, produceCallback } from "../immer.helpers";

type Position = {
    x: number;
    y: number;
};
type ZoomValue = number;
type Zoom = {
    value: ZoomValue;
    offset: Position;
};

type State = {
    isDragging: boolean;
    scaled: ZoomValue;
    position: Position;
    oppositeScaled: ZoomValue;
    rayPosition: Position;
    rayAngleRad: number;
};

const INITIAL_STATE: State = {
    isDragging: false,
    scaled: 1,
    position: { x: 0, y: 0 },
    oppositeScaled: 1,
    rayPosition: { x: 0, y: 0 },
    rayAngleRad: 0,
};

const createStore = (id: CanvasMetadata["id"]) =>
    create<Immer<State>>()(
        devtools(
            set => ({
                ...INITIAL_STATE,
                set: callback => set(produceCallback(callback)),
                reset: () => set(INITIAL_STATE),
            }),
            { name: id }
        )
    );

export {
    createStore as _createCachedViewportStore,
    type State as CachedViewportState,
    type Zoom as CachedViewportZoom,
    type Position as CachedViewportPosition,
    type ZoomValue as CachedViewportZoomValue,
};
