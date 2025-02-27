import { LazyStore } from "@tauri-apps/plugin-store";
import { create } from "zustand";
import { createJSONStorage, devtools } from "zustand/middleware";
import { WORKING_MODE } from "@/views/selectMode";
import { tauriStorage } from "@/lib/stores/tauri-storage-adapter.helpers";

const STORE_NAME = "working-mode";
const STORE_FILE = new LazyStore(`${STORE_NAME}.dat`);

type State = {
    workingMode: WORKING_MODE | null;
    setWorkingMode: (mode: WORKING_MODE) => void;
    resetWorkingMode: () => void;
};

const INITIAL_STATE: Pick<State, "workingMode"> = {
    workingMode: null,
};

const useWorkingModeStore = create<State>()(
    devtools(
        set => ({
            ...INITIAL_STATE,
            setWorkingMode: mode => set(() => ({ workingMode: mode })),
            resetWorkingMode: () =>
                set(() => ({ workingMode: INITIAL_STATE.workingMode })),
        }),
        {
            name: STORE_NAME,
            storage: createJSONStorage(() => tauriStorage(STORE_FILE)),
        }
    )
);

export { useWorkingModeStore, INITIAL_STATE, type State };
