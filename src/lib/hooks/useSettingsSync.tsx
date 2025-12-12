import { useEffect } from "react";
import { emit, listen } from "@tauri-apps/api/event";
import {
    GlobalSettingsStore,
    LANGUAGES,
    THEMES,
} from "@/lib/stores/GlobalSettings";
import { CustomThemeStore, CustomTheme } from "@/lib/stores/CustomTheme";
import { applyCustomTheme } from "@/lib/hooks/useCustomTheme";
import i18n from "@/lib/locales/i18n";

type SettingsChangePayload =
    | { type: "language"; value: string }
    | { type: "theme"; value: string }
    | { type: "customTheme"; theme: CustomTheme | null };

const SETTINGS_CHANGE_EVENT = "settings-change";

export const emitSettingsChange = async (payload: SettingsChangePayload) => {
    await emit(SETTINGS_CHANGE_EVENT, payload);
};

export const useSettingsSync = () => {
    useEffect(() => {
        const unlisten = listen<SettingsChangePayload>(
            SETTINGS_CHANGE_EVENT,
            event => {
                const { payload } = event;

                if (payload.type === "language") {
                    i18n.changeLanguage(payload.value);
                    GlobalSettingsStore.actions.settings.language.setLanguage(
                        payload.value as LANGUAGES
                    );
                } else if (payload.type === "theme") {
                    GlobalSettingsStore.actions.settings.interface.setTheme(
                        payload.value as THEMES
                    );
                } else if (payload.type === "customTheme") {
                    const { theme } = payload;
                    CustomThemeStore.actions.setActiveTheme(theme?.id ?? null);
                    applyCustomTheme(theme);
                }
            }
        );

        return () => {
            unlisten.then(fn => fn());
        };
    }, []);
};
