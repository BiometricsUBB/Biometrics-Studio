import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { CanvasMetadata } from "@/components/pixi/canvas/hooks/useCanvasContext";
// eslint-disable-next-line import/no-cycle
import { MarkingClass } from "@/lib/markings/MarkingClass";
import { Immer, produceCallback } from "../immer.helpers";

type LastAddedMarkerState = {
    marking: MarkingClass;
    canvasId: CanvasMetadata["id"];
} | null;

type State = {
    lastAddedMarking: LastAddedMarkerState;
};

const INITIAL_STATE: State = {
    lastAddedMarking: null,
};

const useStore = create<Immer<State>>()(
    devtools(set => ({
        ...INITIAL_STATE,
        set: callback => set(produceCallback(callback)),
        reset: () => set(INITIAL_STATE),
    }))
);

export { useStore as _useGlobalStateStore, type State as GlobalState };
