import { devtools } from "zustand/middleware";
import { create } from "zustand";
import { CanvasMetadata } from "@/components/pixi/canvas/hooks/useCanvasContext";
import { Immer, produceCallback } from "../immer.helpers";

type ShallowViewportSize = {
    screenWorldWidth: number;
    screenWorldHeight: number;
    worldWidth: number;
    worldHeight: number;
};

type State = {
    size: ShallowViewportSize;
};

const INITIAL_STATE: State = {
    size: {
        screenWorldHeight: 1,
        screenWorldWidth: 1,
        worldHeight: 1,
        worldWidth: 1,
    },
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
    createStore as _createShallowViewportStore,
    type State as ShallowViewportState,
    type ShallowViewportSize,
};
