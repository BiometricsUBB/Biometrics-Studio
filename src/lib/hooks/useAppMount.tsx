import { useTheme } from "@/lib/hooks/useTheme";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { GlobalSettingsStore, LANGUAGES } from "../stores/GlobalSettings";
import { invoke } from "@tauri-apps/api/core";

export const useAppMount = () => {
    const [hasMounted, setHasMounted] = useState(false);
    const { setTheme } = useTheme();
    const theme = GlobalSettingsStore.use(state => {
        return state.settings.interface.theme;
    });

    const { i18n } = useTranslation();
    const language = GlobalSettingsStore.use(state => {
        return state.settings.language;
    });

    useEffect(() => {
        setTheme(theme);
    }, [setTheme, theme]);

    useEffect(() => {
        const setLanguage = (lng: LANGUAGES) => {
            i18n.changeLanguage(lng);
        };
        setLanguage(language);
    }, [i18n, language]);

    useEffect(() => {
        const callback = async () => {
            await invoke("close_splashscreen_if_exists");
            await invoke("show_main_window_if_hidden");
        };
        callback();
        setHasMounted(true);
    }, []);

    return hasMounted;
};
