import { useEffect } from "react";
import { GlobalSettingsStore, THEMES } from "@/lib/stores/GlobalSettings";

export const useTheme = () => {
    const { theme } = GlobalSettingsStore.state.settings.interface;

    const setTheme = (theme: THEMES) => {
        GlobalSettingsStore.actions.settings.interface.setTheme(theme);
    };

    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove("light", "dark");

        if (theme === "system") {
            const systemTheme = window.matchMedia(
                "(prefers-color-scheme: dark)"
            ).matches
                ? "dark"
                : "light";
            root.classList.add(systemTheme);
        } else {
            root.classList.add(theme);
        }
    }, [theme]);

    return { theme, setTheme };
};
