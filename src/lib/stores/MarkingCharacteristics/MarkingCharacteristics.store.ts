import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { MarkingCharacteristic } from "@/lib/markings/MarkingCharacteristic";
import { create } from "zustand";
import { tauriStorage } from "@/lib/stores/tauri-storage-adapter.helpers";
import { createStore, Store } from "@tauri-apps/plugin-store";
import { Immer, produceCallback } from "../immer.helpers";

const STORE_NAME = "characteristics";
const STORE_FILE: Store = await createStore(`${STORE_NAME}.dat`);

type State = {
    activeCharacteristics: MarkingCharacteristic[];
    characteristics: MarkingCharacteristic[];
};

const INITIAL_STATE: State = {
    activeCharacteristics: [],
    characteristics: [],
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

export {
    useStore as _useMarkingCharacteristicsStore,
    type State as MarkingCharacteristicsState,
};
