import { invoke } from "@tauri-apps/api/core";
import { Settings as MenuIcon } from "lucide-react";
import { ICON } from "@/lib/utils/const";
import { Toggle } from "@/components/ui/toggle";
import { useTranslation } from "react-i18next";

export function SettingsMenu() {
    const { t } = useTranslation();
    const openSettingsWindow = async () => {
        try {
            await invoke("open_settings_window");
        } catch (error) {
            console.error("Failed to open settings window:", error);
        }
    };

    return (
        <Toggle
            pressed={false}
            onClickCapture={openSettingsWindow}
            aria-label={t("Open settings", { ns: "description" })}
        >
            <MenuIcon size={ICON.SIZE} strokeWidth={ICON.STROKE_WIDTH} />
        </Toggle>
    );
}
