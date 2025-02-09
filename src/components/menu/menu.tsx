import { Menubar } from "@/components/ui/menubar";
import { SettingsMenu } from "@/components/menu/settings-menu";
import { cn } from "@/lib/utils/shadcn";
import { ICON } from "@/lib/utils/const";
import { ModeMenu } from "@/components/menu/mode-menu";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import MarkingTypesDialogPortal from "@/components/dialogs/marking-types/marking-types-dialog-portal";
import { WindowControls } from "@/components/menu/window-controls";
import { useTranslation } from "react-i18next";
import { WorkingModeStore } from "@/lib/stores/WorkingMode";

export function Menu() {
    const { t } = useTranslation();
    const workingMode = WorkingModeStore.use(state => state.workingMode);

    return (
        <Menubar
            className={cn("flex justify-between w-screen")}
            data-tauri-drag-region
        >
            <div className="flex grow-1">
                <div className="flex items-center px-2">
                    <img
                        src="/logo.svg"
                        alt="Logo"
                        className="pointer-events-none select-none"
                        height={ICON.SIZE}
                        width={ICON.SIZE}
                    />
                </div>
                <SettingsMenu />
                {workingMode && (
                    <div className="flex flex-row items-center [&>*]:h-full">
                        <ModeMenu />
                        <span className="mx-2 !h-auto">•</span>
                        <Dialog>
                            <DialogTrigger>{t("Types")}</DialogTrigger>
                            <MarkingTypesDialogPortal />
                        </Dialog>
                    </div>
                )}
            </div>
            <WindowControls />
        </Menubar>
    );
}
