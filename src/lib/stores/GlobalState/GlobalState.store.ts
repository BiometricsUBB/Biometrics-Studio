import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { CanvasMetadata } from "@/components/pixi/canvas/hooks/useCanvasContext";
// eslint-disable-next-line import/no-cycle
import { Immer, produceCallback } from "../immer.helpers";

// Nowy typ: wybór do scalenia
export type PendingMerge = {
    canvasId: CanvasMetadata["id"];
    label: number;
} | null;

type State = {
    pendingMerge: PendingMerge;
};

const INITIAL_STATE: State = {
    pendingMerge: null,
};

const useStore = create<Immer<State>>()(
    devtools(set => ({
        ...INITIAL_STATE,
        set: callback => set(produceCallback(callback)),
        reset: () => set(INITIAL_STATE),
    }))
);

export { useStore as _useGlobalStateStore, type State as GlobalState };
