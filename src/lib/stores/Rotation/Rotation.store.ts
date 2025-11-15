import { devtools } from "zustand/middleware";
import { CanvasMetadata } from "@/components/pixi/canvas/hooks/useCanvasContext";
import { createWithEqualityFn } from "zustand/traditional";
import { Immer, produceCallback } from "../immer.helpers";

type State = {
    rotation: number; // in radians
};

const INITIAL_STATE: State = {
    rotation: 0,
};

const createStore = (id: CanvasMetadata["id"]) =>
    createWithEqualityFn<Immer<State>>()(
        devtools(
            set => ({
                ...INITIAL_STATE,
                set: callback => set(produceCallback(callback)),
                reset: () => set(INITIAL_STATE),
            }),
            { name: `rotation-${id}` }
        )
    );

export { createStore as _createRotationStore, type State as RotationState };
