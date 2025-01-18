import { createStore, Store } from "@tauri-apps/plugin-store";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { MARKING_CLASS } from "@/lib/markings/MarkingBase";
import { Immer, produceCallback } from "../immer.helpers";
import { tauriStorage } from "../tauri-storage-adapter.helpers";

const STORE_NAME = "toolbar-settings";
const STORE_FILE: Store = await createStore(`${STORE_NAME}.dat`);

export const enum CURSOR_MODES {
    SELECTION = "selection",
    MARKING = "marking",
}

type Settings = {
    cursor: {
        mode: CURSOR_MODES;
    };
    marking: {
        markingClass: MARKING_CLASS;
    };
    viewport: {
        locked: boolean;
        scaleSync: boolean;
    };
};

type State = {
    settings: Settings;
};

const INITIAL_STATE: State = {
    settings: {
        cursor: {
            mode: CURSOR_MODES.SELECTION,
        },
        marking: {
            markingClass: MARKING_CLASS.POINT,
        },
        viewport: {
            locked: false,
            scaleSync: false,
        },
    },
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
    useStore as _useDashboardToolbarStore,
    type State as DashboardToolbarState,
};
