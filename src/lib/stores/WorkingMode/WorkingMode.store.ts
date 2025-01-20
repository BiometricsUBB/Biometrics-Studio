import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { WORKING_MODE } from "@/views/selectMode";
import { createStore, Store } from "@tauri-apps/plugin-store";
import { tauriStorage } from "@/lib/stores/tauri-storage-adapter.helpers";

const STORE_NAME = "working-mode";
const STORE_FILE: Store = await createStore(`${STORE_NAME}.dat`);

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
        persist(
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
    )
);

export { useWorkingModeStore, INITIAL_STATE, type State };
