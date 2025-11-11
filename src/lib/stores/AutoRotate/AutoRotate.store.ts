import { devtools } from "zustand/middleware";
import { createWithEqualityFn } from "zustand/traditional";
import { LineSegmentMarking } from "@/lib/markings/LineSegmentMarking";
import { CANVAS_ID } from "@/components/pixi/canvas/hooks/useCanvasContext";
import { Immer, produceCallback } from "../immer.helpers";

type State = {
    tempLines: Record<CANVAS_ID, LineSegmentMarking | null>;
    finishedLines: Record<CANVAS_ID, LineSegmentMarking | null>;
};

const INITIAL_STATE: State = {
    tempLines: {
        [CANVAS_ID.LEFT]: null,
        [CANVAS_ID.RIGHT]: null,
    },
    finishedLines: {
        [CANVAS_ID.LEFT]: null,
        [CANVAS_ID.RIGHT]: null,
    },
};

const createStore = () =>
    createWithEqualityFn<Immer<State>>()(
        devtools(
            set => ({
                ...INITIAL_STATE,
                set: callback => set(produceCallback(callback)),
                reset: () => set(INITIAL_STATE),
            }),
            { name: "autorotate" }
        )
    );

export { createStore as _createAutoRotateStore, type State as AutoRotateState };
