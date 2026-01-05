import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils/shadcn";
import { HTMLAttributes, useState } from "react";

import {
    CURSOR_MODES,
    DashboardToolbarStore,
} from "@/lib/stores/DashboardToolbar";
import { CANVAS_ID } from "@/components/pixi/canvas/hooks/useCanvasContext";
import {
    Hand,
    LockKeyhole,
    LockKeyholeOpen,
    SendToBack,
    ChevronDown,
    RotateCw,
    RotateCcw,
    Crosshair,
    Settings,
} from "lucide-react";
import { ICON } from "@/lib/utils/const";
import { useTranslation } from "react-i18next";
import { MarkingTypesStore } from "@/lib/stores/MarkingTypes/MarkingTypes";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuPortal,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog } from "@/components/ui/dialog";
import MarkingTypesDialogPortal from "@/components/dialogs/marking-types/marking-types-dialog-portal";
import { RotationStore } from "@/lib/stores/Rotation/Rotation";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { RotationPanel } from "./rotation-panel";

export type VerticalToolbarProps = HTMLAttributes<HTMLDivElement>;

export function VerticalToolbar({ className, ...props }: VerticalToolbarProps) {
    const { t } = useTranslation();
    const [isTypesDialogOpen, setIsTypesDialogOpen] = useState(false);

    const { mode: cursorMode } = DashboardToolbarStore.use(
        state => state.settings.cursor
    );

    const { locked: isViewportLocked, scaleSync: isViewportScaleSync } =
        DashboardToolbarStore.use(state => state.settings.viewport);

    const availableMarkingTypes = MarkingTypesStore.use(state => state.types);

    const selectedMarkingType = MarkingTypesStore.use(state =>
        state.types.find(t => t.id === state.selectedTypeId)
    );

    return (
        <div
            className={cn(
                "flex flex-col gap-4 p-4 pb-8 h-full overflow-y-auto",
                className
            )}
            {...props}
        >
            <div className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold">
                    {t("Control", { ns: "keywords" })}
                </h3>
                <ToggleGroup
                    type="single"
                    value={cursorMode}
                    className="flex flex-col gap-1"
                >
                    <ToggleGroupItem
                        value={CURSOR_MODES.SELECTION}
                        className="w-full justify-start gap-2"
                        onClick={() => {
                            DashboardToolbarStore.actions.settings.cursor.setCursorMode(
                                CURSOR_MODES.SELECTION
                            );
                        }}
                    >
                        <Hand
                            className="flex-shrink-0"
                            size={ICON.SIZE}
                            strokeWidth={ICON.STROKE_WIDTH}
                        />
                        <span className="text-sm">
                            {t("Mode.Selection", { ns: "cursor" })}
                        </span>
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        value={CURSOR_MODES.MARKING}
                        className="w-full justify-start gap-2"
                        onClick={() => {
                            DashboardToolbarStore.actions.settings.cursor.setCursorMode(
                                CURSOR_MODES.MARKING
                            );
                        }}
                    >
                        <Crosshair
                            className="flex-shrink-0"
                            size={ICON.SIZE}
                            strokeWidth={ICON.STROKE_WIDTH}
                        />
                        <span className="text-sm">
                            {t("Mode.Marking", { ns: "cursor" })}
                        </span>
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        value={CURSOR_MODES.AUTOROTATE}
                        className="w-full justify-start gap-2"
                        onClick={() => {
                            DashboardToolbarStore.actions.settings.cursor.setCursorMode(
                                CURSOR_MODES.AUTOROTATE
                            );
                        }}
                    >
                        <RotateCw
                            className="flex-shrink-0"
                            size={ICON.SIZE}
                            strokeWidth={ICON.STROKE_WIDTH}
                        />
                        <span className="text-sm">
                            {t("Mode.Rotation", { ns: "cursor" })}
                        </span>
                    </ToggleGroupItem>
                </ToggleGroup>

                <div
                    className={cn(
                        "overflow-hidden transition-all duration-300 ease-in-out",
                        cursorMode === CURSOR_MODES.AUTOROTATE
                            ? "max-h-96 opacity-100 mt-2"
                            : "max-h-0 opacity-0"
                    )}
                >
                    <RotationPanel />
                </div>
            </div>

            <div className="border-t border-border/30" />

            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">
                        {t("Types", { ns: "keywords" })}
                    </h3>
                    <Dialog
                        open={isTypesDialogOpen}
                        onOpenChange={setIsTypesDialogOpen}
                    >
                        <button
                            type="button"
                            onClick={() => setIsTypesDialogOpen(true)}
                            className="p-1.5 rounded-md hover:bg-accent hover:text-accent-foreground"
                            title={t("Types", { ns: "keywords" })}
                        >
                            <Settings
                                size={16}
                                strokeWidth={ICON.STROKE_WIDTH}
                            />
                        </button>
                        <MarkingTypesDialogPortal />
                    </Dialog>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger
                        className={cn(
                            "w-full overflow-hidden text-ellipsis whitespace-nowrap flex items-center justify-between gap-2 px-3 py-2.5",
                            "border border-input rounded-md",
                            "hover:bg-accent hover:text-accent-foreground transition-colors",
                            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                            "disabled:pointer-events-none disabled:opacity-50"
                        )}
                        disabled={!availableMarkingTypes.length}
                    >
                        <div className="flex items-center gap-2 overflow-hidden">
                            {selectedMarkingType && (
                                <div
                                    className="w-4 h-4 rounded-sm border border-border/40 flex-shrink-0"
                                    style={{
                                        backgroundColor:
                                            selectedMarkingType.backgroundColor as string,
                                    }}
                                />
                            )}
                            <span className="overflow-hidden text-ellipsis whitespace-nowrap text-sm">
                                {selectedMarkingType?.displayName ??
                                    t("None", { ns: "keybindings" })}
                            </span>
                        </div>
                        <ChevronDown
                            size={16}
                            strokeWidth={ICON.STROKE_WIDTH}
                            className="flex-shrink-0"
                        />
                    </DropdownMenuTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuContent className="max-h-[50vh] overflow-y-auto z-[9999] min-w-[200px]">
                            {availableMarkingTypes.map(type => (
                                <DropdownMenuItem
                                    key={type.id}
                                    onClick={() => {
                                        MarkingTypesStore.actions.selectedType.set(
                                            type.id
                                        );
                                    }}
                                    className="cursor-pointer"
                                >
                                    <div
                                        className="w-4 h-4 rounded-sm border border-border/40 flex-shrink-0"
                                        style={{
                                            backgroundColor:
                                                type.backgroundColor as string,
                                        }}
                                    />
                                    <span>{type.displayName}</span>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenuPortal>
                </DropdownMenu>
            </div>

            <div className="border-t border-border/30" />

            <div className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold">
                    {t("Tools", { ns: "keywords" })}
                </h3>
                <div className="flex flex-col gap-2">
                    <Toggle
                        variant="outline"
                        className="w-full justify-start gap-2 h-auto min-h-[40px] py-2 px-3"
                        pressed={isViewportLocked}
                        onClick={
                            DashboardToolbarStore.actions.settings.viewport
                                .toggleLockedViewport
                        }
                    >
                        {isViewportLocked ? (
                            <LockKeyhole
                                className="flex-shrink-0"
                                size={ICON.SIZE}
                                strokeWidth={ICON.STROKE_WIDTH}
                            />
                        ) : (
                            <LockKeyholeOpen
                                className="flex-shrink-0"
                                size={ICON.SIZE}
                                strokeWidth={ICON.STROKE_WIDTH}
                            />
                        )}
                        <span className="text-sm text-left leading-tight">
                            {t("Lock viewports", { ns: "tooltip" })}
                        </span>
                    </Toggle>

                    <Toggle
                        variant="outline"
                        className="w-full justify-start gap-2 h-auto min-h-[40px] py-2 px-3"
                        pressed={isViewportScaleSync}
                        onClick={
                            DashboardToolbarStore.actions.settings.viewport
                                .toggleLockScaleSync
                        }
                    >
                        <SendToBack
                            className="flex-shrink-0"
                            size={ICON.SIZE}
                            strokeWidth={ICON.STROKE_WIDTH}
                        />
                        <span className="text-sm text-left leading-tight">
                            {t("Synchronize viewports with scale", {
                                ns: "tooltip",
                            })}
                        </span>
                    </Toggle>

                    <Toggle
                        variant="outline"
                        className="w-full justify-start gap-2 h-auto min-h-[40px] py-2 px-3"
                        onClick={() => {
                            RotationStore(
                                CANVAS_ID.LEFT
                            ).actions.resetRotation();
                            RotationStore(
                                CANVAS_ID.RIGHT
                            ).actions.resetRotation();
                        }}
                    >
                        <RotateCcw
                            className="flex-shrink-0"
                            size={ICON.SIZE}
                            strokeWidth={ICON.STROKE_WIDTH}
                        />
                        <span className="text-sm text-left leading-tight">
                            {t("Reset rotation", { ns: "tooltip" })}
                        </span>
                    </Toggle>
                </div>
            </div>
        </div>
    );
}
