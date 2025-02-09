import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { WORKING_MODE } from "@/views/selectMode";
import { createStore, Store } from "@tauri-apps/plugin-store";
import { tauriStorage } from "@/lib/stores/tauri-storage-adapter.helpers";
import { MarkingCharacteristic } from "@/lib/markings/MarkingCharacteristic";
import { Immer, produceCallback } from "../immer.helpers";

const STORE_NAME = "keybindings";
const STORE_FILE: Store = await createStore(`${STORE_NAME}.dat`);

export type CharacteristicKeybinding = {
    workingMode: WORKING_MODE;
    boundKey: string;
    characteristicId: MarkingCharacteristic["id"];
};

type State = {
    characteristicsKeybindings: CharacteristicKeybinding[];
};

const INITIAL_STATE: State = {
    characteristicsKeybindings: [],
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
