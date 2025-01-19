import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { WORKING_MODE } from "@/views/selectMode";

type State = {
    workingMode: WORKING_MODE | null;
    setWorkingMode: (mode: WORKING_MODE | null) => void;
    resetWorkingMode: () => void;
};

const INITIAL_STATE: Pick<State, "workingMode"> = {
    workingMode: null,
};

const useWorkingModeStore = create<State>()(
    devtools(
        persist(
            set => ({
                ...INITIAL_STATE,
                setWorkingMode: mode => set(() => ({ workingMode: mode })),
                resetWorkingMode: () =>
                    set(() => ({ workingMode: INITIAL_STATE.workingMode })),
            }),
            {
                name: "working-mode",
            }
        )
    )
);

export { useWorkingModeStore, INITIAL_STATE, type State };
