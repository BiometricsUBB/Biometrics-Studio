import { devtools } from "zustand/middleware";
import { CanvasMetadata } from "@/components/pixi/canvas/hooks/useCanvasContext";
import { createWithEqualityFn } from "zustand/traditional";
// eslint-disable-next-line import/no-cycle
import { EmptyableMarking } from "@/components/information-tabs/markings-info/columns";
import { MarkingBase } from "@/lib/markings/MarkingBase";
import { Immer, produceCallback } from "../immer.helpers";

export type RenderableMarking = MarkingBase & {
    visible: boolean;
};

type State = {
    markingsHash: string;
    markings: MarkingBase[];
    selectedMarking: EmptyableMarking | null;
    temporaryMarking: MarkingBase | null;
};

const INITIAL_STATE: State = {
    markingsHash: crypto.randomUUID(),
    temporaryMarking: null,
    selectedMarking: null,
    markings: [],
};

const createStore = (id: CanvasMetadata["id"]) =>
    createWithEqualityFn<Immer<State>>()(
        devtools(
            set => ({
                ...INITIAL_STATE,
                set: callback => set(produceCallback(callback)),
                reset: () => set(INITIAL_STATE),
            }),
            { name: id }
        )
    );

export { createStore as _createMarkingsStore, type State as MarkingsState };
