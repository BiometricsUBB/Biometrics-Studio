import { Menubar } from "@/components/ui/menubar";
import { SettingsMenu } from "@/components/menu/settings-menu";
import { cn } from "@/lib/utils/shadcn";
import { ICON } from "@/lib/utils/const";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import MarkingCharacteristicsDialogPortal from "@/components/dialogs/marking-characteristics/marking-characteristics-dialog-portal";
import { WindowControls } from "@/components/menu/window-controls";
import { useTranslation } from "react-i18next";

export function Menu() {
    const { t } = useTranslation();

    return (
        <Menubar
            className={cn("flex justify-between w-screen")}
            data-tauri-drag-region
        >
            <div className="flex grow-1">
                <div className="flex items-center px-2">
                    <img
                        src="/public/logo.svg"
                        alt="Logo"
                        className="pointer-events-none select-none"
                        height={ICON.SIZE}
                        width={ICON.SIZE}
                    />
                </div>
                <SettingsMenu />
                <Dialog>
                    <DialogTrigger>{t("Characteristics")}</DialogTrigger>
                    <MarkingCharacteristicsDialogPortal />
                </Dialog>
            </div>
            <WindowControls />
        </Menubar>
    );
}
