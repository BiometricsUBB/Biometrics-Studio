import { useEffect } from "react";
import { emit, listen } from "@tauri-apps/api/event";
import {
    GlobalSettingsStore,
    LANGUAGES,
    THEMES,
} from "@/lib/stores/GlobalSettings";
import i18n from "@/lib/locales/i18n";

interface SettingsChangePayload {
    type: "language" | "theme";
    value: string;
}

const SETTINGS_CHANGE_EVENT = "settings-change";

export const emitSettingsChange = async (payload: SettingsChangePayload) => {
    await emit(SETTINGS_CHANGE_EVENT, payload);
};

export const useSettingsSync = () => {
    useEffect(() => {
        const unlisten = listen<SettingsChangePayload>(
            SETTINGS_CHANGE_EVENT,
            event => {
                const { type, value } = event.payload;

                if (type === "language") {
                    i18n.changeLanguage(value);
                    GlobalSettingsStore.actions.settings.language.setLanguage(
                        value as LANGUAGES
                    );
                } else if (type === "theme") {
                    GlobalSettingsStore.actions.settings.interface.setTheme(
                        value as THEMES
                    );
                }
            }
        );

        return () => {
            unlisten.then(fn => fn());
        };
    }, []);
};
