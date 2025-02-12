import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { LazyStore } from "@tauri-apps/plugin-store";
import { WORKING_MODE } from "@/views/selectMode";
import { tauriStorage } from "@/lib/stores/tauri-storage-adapter.helpers";
import { MarkingType } from "@/lib/markings/MarkingType";
import { Immer, produceCallback } from "../immer.helpers";

const STORE_NAME = "keybindings";
const STORE_FILE = new LazyStore(`${STORE_NAME}.dat`);

export type TypeKeybinding = {
    workingMode: WORKING_MODE;
    boundKey: string;
    typeId: MarkingType["id"];
};

type State = {
    typesKeybindings: TypeKeybinding[];
};

const INITIAL_STATE: State = {
    typesKeybindings: [],
};

const useStore = create<Immer<State>>()(
    persist(
        devtools(set => ({
            ...INITIAL_STATE,
            set: callback => set(produceCallback(callback)),
            reset: () => set(INITIAL_STATE),
        })),
        {
            name: STORE_NAME,
            storage: createJSONStorage(() => tauriStorage(STORE_FILE)),
        }
    )
);

export { useStore as _useKeybindingsStore, type State as KeybindingsState };
