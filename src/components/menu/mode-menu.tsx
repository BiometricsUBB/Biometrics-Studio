import {
    MenubarCheckboxItem,
    MenubarContent,
    MenubarMenu,
    MenubarPortal,
    MenubarTrigger,
} from "@/components/ui/menubar";
import { t } from "i18next";
import { useWorkingMode } from "@/lib/providers/WorkingModeProvider";
import { WORKING_MODE } from "@/views/selectMode";

export function ModeMenu() {
    const { workingMode, setWorkingMode } = useWorkingMode();

    return (
        <MenubarMenu>
            <MenubarTrigger>{t("Working mode")}</MenubarTrigger>
            <MenubarPortal>
                <MenubarContent>
                    {Object.values(WORKING_MODE).map(mode => (
                        <MenubarCheckboxItem
                            key={mode}
                            checked={workingMode === mode}
                            onCheckedChange={() => setWorkingMode(mode)}
                        >
                            {t(mode, { ns: "modes" })}
                        </MenubarCheckboxItem>
                    ))}
                </MenubarContent>
            </MenubarPortal>
        </MenubarMenu>
    );
}
