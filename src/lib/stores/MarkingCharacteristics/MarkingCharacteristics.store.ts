import { createJSONStorage, devtools, persist } from "zustand/middleware";
import {
    MarkingCharacteristic,
    WORKING_MODE,
} from "@/lib/markings/MarkingCharacteristic";
import { MARKING_TYPE } from "@/lib/markings/MarkingBase";
import { create } from "zustand";
import { tauriStorage } from "@/lib/stores/tauri-storage-adapter.helpers";
import { createStore, Store } from "@tauri-apps/plugin-store";
import { Immer, produceCallback } from "../immer.helpers";

const STORE_NAME = "characteristics";
const STORE_FILE: Store = await createStore(`${STORE_NAME}.dat`);

interface TypeCharacteristicPair {
    type: MarkingCharacteristic["type"];
    id: MarkingCharacteristic["id"];
}

type State = {
    selectedCharacteristics: TypeCharacteristicPair[];
    characteristics: MarkingCharacteristic[];
};

const INITIAL_STATE: State = {
    selectedCharacteristics: [
        { type: MARKING_TYPE.POINT, id: "6b40d66ba784449ca38bae9d206899c1" },
        { type: MARKING_TYPE.RAY, id: "a8b19583a7134066a3f4e67caa58ef8f" },
        {
            type: MARKING_TYPE.LINE_SEGMENT,
            id: "621b46c2c27843a1a19ba8c56b7aad43",
        },
    ],
    characteristics: [
        {
            id: "6b40d66ba784449ca38bae9d206899c1",
            name: "Default",
            type: MARKING_TYPE.POINT,
            style: {
                backgroundColor: "#61bd67",
                textColor: "#0a130a",
                size: 10,
            },
            metadata: {
                category: WORKING_MODE.FINGERPRINT,
            },
        },
        {
            id: "a8b19583a7134066a3f4e67caa58ef8f",
            name: "Default",
            type: MARKING_TYPE.RAY,
            style: {
                backgroundColor: "#61bd67",
                textColor: "#0a130a",
                size: 10,
            },
            metadata: {
                category: WORKING_MODE.FINGERPRINT,
            },
        },
        {
            id: "621b46c2c27843a1a19ba8c56b7aad43",
            name: "Default",
            type: MARKING_TYPE.LINE_SEGMENT,
            style: {
                backgroundColor: "#61bd67",
                textColor: "#0a130a",
                size: 10,
            },
            metadata: {
                category: WORKING_MODE.FINGERPRINT,
            },
        },
    ],
};

// TODO Persisting of map is not supported by zustand
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
