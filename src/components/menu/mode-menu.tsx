import {
    MenubarCheckboxItem,
    MenubarContent,
    MenubarMenu,
    MenubarPortal,
    MenubarTrigger,
} from "@/components/ui/menubar";
import { t } from "i18next";
import { WORKING_MODE } from "@/views/selectMode";
import { MarkingsStore } from "@/lib/stores/Markings";
import { CANVAS_ID } from "@/components/pixi/canvas/hooks/useCanvasContext";
import { GlobalStateStore } from "@/lib/stores/GlobalState";
import { WorkingModeStore } from "@/lib/stores/WorkingMode";

export function ModeMenu() {
    const { workingMode, setWorkingMode } = WorkingModeStore.use();

    return (
        <MenubarMenu>
            <MenubarTrigger>
                {t("Working mode")}:{" "}
                {workingMode
                    ? workingMode.charAt(0).toUpperCase() +
                      workingMode.slice(1).toLowerCase()
                    : ""}
            </MenubarTrigger>
            <MenubarPortal>
                <MenubarContent>
                    {Object.values(WORKING_MODE).map(mode => (
                        <MenubarCheckboxItem
                            key={mode}
                            checked={workingMode === mode}
                            onCheckedChange={() => {
                                if (workingMode === mode) {
                                    return;
                                }
                                setWorkingMode(mode);

                                MarkingsStore(
                                    CANVAS_ID.LEFT
                                ).actions.markings.reset();
                                MarkingsStore(
                                    CANVAS_ID.RIGHT
                                ).actions.markings.reset();
                                MarkingsStore(
                                    CANVAS_ID.LEFT
                                ).actions.labelGenerator.reset();
                                MarkingsStore(
                                    CANVAS_ID.RIGHT
                                ).actions.labelGenerator.reset();
                                GlobalStateStore.actions.lastAddedMarking.setLastAddedMarking(
                                    null
                                );
                            }}
                        >
                            {t(mode, { ns: "modes" })}
                        </MenubarCheckboxItem>
                    ))}
                </MenubarContent>
            </MenubarPortal>
        </MenubarMenu>
    );
}
