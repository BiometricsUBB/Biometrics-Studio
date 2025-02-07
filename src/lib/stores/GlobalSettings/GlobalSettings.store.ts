import { createStore } from "@tauri-apps/plugin-store";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { Immer, produceCallback } from "../immer.helpers";
import { tauriStorage } from "../tauri-storage-adapter.helpers";

const STORE_NAME = "global-settings";
const STORE_FILE = await createStore(`${STORE_NAME}.dat`);

export enum THEMES {
    SYSTEM = "system",
    LIGHT = "light",
    DARK = "dark",
}

export enum LANGUAGES {
    ENGLISH = "en",
    POLISH = "pl",
}

type Settings = {
    language: LANGUAGES;
    interface: {
        theme: THEMES;
    };
};

type State = {
    settings: Settings;
};

const INITIAL_STATE: State = {
    settings: {
        language: LANGUAGES.POLISH,
        interface: {
            theme: THEMES.SYSTEM,
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
    useStore as _useGlobalSettingsStore,
    type State as GlobalSettingsState,
};
