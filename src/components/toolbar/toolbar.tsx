import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils/shadcn";
import { HTMLAttributes } from "react";
import {
    CURSOR_MODES,
    DashboardToolbarStore,
} from "@/lib/stores/DashboardToolbar";
import {
    Crosshair,
    Hand,
    LockKeyhole,
    LockKeyholeOpen,
    SendToBack,
    ChevronDown,
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
import { WorkingModeStore } from "@/lib/stores/WorkingMode";
import Separator from "@/components/toolbar/separator";
import { ToolbarGroup } from "./group";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";

export type GlobalToolbarProps = HTMLAttributes<HTMLDivElement>;
export function GlobalToolbar({ className, ...props }: GlobalToolbarProps) {
    const { t } = useTranslation();

    const { mode: cursorMode } = DashboardToolbarStore.use(
        state => state.settings.cursor
    );
    const workingMode = WorkingModeStore.use(state => state.workingMode);

    const { locked: isViewportLocked, scaleSync: isViewportScaleSync } =
        DashboardToolbarStore.use(state => state.settings.viewport);

    const availableMarkingTypesForWorkingMode = MarkingTypesStore.use(state =>
        state.types.filter(t => t.category === workingMode)
    );

    const selectedMarkingType = MarkingTypesStore.use(state =>
        state.types.find(t => t.id === state.selectedTypeId)
    );

    if (!selectedMarkingType && availableMarkingTypesForWorkingMode.length) {
        MarkingTypesStore.actions.selectedType.set(
            availableMarkingTypesForWorkingMode[0]!.id
        );
    }

    return (
        <div
            className={cn(
                "flex items-center gap-2 py-0.5 justify-center w-fit h-fit rounded-md",
                className
            )}
            {...props}
        >
            {/* Selected cursor mode e.g. selection/marking */}
            <ToolbarGroup>
                <ToggleGroup
                    type="single"
                    value={cursorMode}
                    variant="outline"
                    size="icon"
                >
                    <ToggleGroupItem
                        value={CURSOR_MODES.SELECTION}
                        title={`${t("Mode.Selection", { ns: "cursor" })} (F1)`}
                        onClick={() => {
                            DashboardToolbarStore.actions.settings.cursor.setCursorMode(
                                CURSOR_MODES.SELECTION
                            );
                        }}
                    >
                        <Hand
                            className="p-px"
                            size={ICON.SIZE}
                            strokeWidth={ICON.STROKE_WIDTH}
                        />
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        value={CURSOR_MODES.MARKING}
                        title={`${t("Mode.Marking", { ns: "cursor" })} (F3)`}
                        onClick={() => {
                            DashboardToolbarStore.actions.settings.cursor.setCursorMode(
                                CURSOR_MODES.MARKING
                            );
                        }}
                    >
                        <Crosshair
                            size={ICON.SIZE}
                            strokeWidth={ICON.STROKE_WIDTH}
                        />
                    </ToggleGroupItem>
                </ToggleGroup>
            </ToolbarGroup>

            <Separator />

            <ToolbarGroup>
                {/* Selected type and dropdown menu with existing types */}
                <DropdownMenu>
                    <DropdownMenuTrigger
                        className={cn(
                            "w-36 mr-2 overflow-hidden text-ellipsis whitespace-nowrap flex items-row justify-between items-center px-1",
                            className
                        )}
                        disabled={!availableMarkingTypesForWorkingMode.length}
                    >
                        <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                            {selectedMarkingType?.displayName ??
                                t("None", { ns: "keybindings" })}
                        </span>
                        <ChevronDown
                            size={16}
                            strokeWidth={ICON.STROKE_WIDTH}
                            className="ml-2 flex-shrink-0"
                        />
                    </DropdownMenuTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuContent className="max-h-[50vh] overflow-y-auto  ">
                            {availableMarkingTypesForWorkingMode.map(type => (
                                <DropdownMenuItem
                                    key={type.id}
                                    onClick={() => {
                                        MarkingTypesStore.actions.selectedType.set(
                                            type.id
                                        );
                                    }}
                                >
                                    {type.displayName}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenuPortal>
                </DropdownMenu>
            </ToolbarGroup>

            <Separator />

            {/* Additional tools */}
            <ToolbarGroup>
                <Toggle
                    variant="outline"
                    title={`${t("Lock viewports", { ns: "tooltip" })} (L)`}
                    size="icon"
                    pressed={isViewportLocked}
                    onClick={
                        DashboardToolbarStore.actions.settings.viewport
                            .toggleLockedViewport
                    }
                >
                    {isViewportLocked ? (
                        <LockKeyhole
                            size={ICON.SIZE}
                            strokeWidth={ICON.STROKE_WIDTH}
                        />
                    ) : (
                        <LockKeyholeOpen
                            size={ICON.SIZE}
                            strokeWidth={ICON.STROKE_WIDTH}
                        />
                    )}
                </Toggle>

                <Toggle
                    variant="outline"
                    title={`${t("Synchronize viewports with scale", { ns: "tooltip" })} (M)`}
                    size="icon"
                    pressed={isViewportScaleSync}
                    onClick={
                        DashboardToolbarStore.actions.settings.viewport
                            .toggleLockScaleSync
                    }
                >
                    <SendToBack
                        size={ICON.SIZE}
                        strokeWidth={ICON.STROKE_WIDTH}
                    />
                </Toggle>
            </ToolbarGroup>
        </div>
    );
}
