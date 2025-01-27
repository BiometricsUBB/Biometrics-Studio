import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils/shadcn";
import { HTMLAttributes } from "react";
import {
    CURSOR_MODES,
    DashboardToolbarStore,
} from "@/lib/stores/DashboardToolbar";
import {
    Dot,
    DraftingCompass,
    Fingerprint,
    LockKeyhole,
    LockKeyholeOpen,
    MousePointer,
    SendToBack,
    Spline,
    Square,
} from "lucide-react";
import { ICON } from "@/lib/utils/const";
import { MARKING_CLASS } from "@/lib/markings/MarkingBase";
import { useTranslation } from "react-i18next";
import { MarkingCharacteristicsStore } from "@/lib/stores/MarkingCharacteristics/MarkingCharacteristics";
import { useDebouncedCallback } from "use-debounce";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuPortal,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    defaultBackgroundColor,
    defaultSize,
    defaultTextColor,
} from "@/lib/markings/MarkingCharacteristic";
import { WorkingModeStore } from "@/lib/stores/WorkingMode";
import { ToolbarGroup } from "./group";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { Input } from "../ui/input";

export type GlobalToolbarProps = HTMLAttributes<HTMLDivElement>;
export function GlobalToolbar({ className, ...props }: GlobalToolbarProps) {
    const { t } = useTranslation();

    const { mode: cursorMode } = DashboardToolbarStore.use(
        state => state.settings.cursor
    );
    const workingMode = WorkingModeStore.use(state => state.workingMode);

    const { locked: isViewportLocked, scaleSync: isViewportScaleSync } =
        DashboardToolbarStore.use(state => state.settings.viewport);

    const { markingClass: selectedMarkingClass } = DashboardToolbarStore.use(
        state => state.settings.marking
    );

    const activeCharacteristics = MarkingCharacteristicsStore.use(
        state => state.activeCharacteristics
    );

    const selectedCharacteristic = activeCharacteristics.find(
        characteristic =>
            characteristic.markingClass === selectedMarkingClass &&
            characteristic.category === workingMode
    );

    const availableMarkingCharacteristicsForWorkingMode =
        MarkingCharacteristicsStore.use(state =>
            state.characteristics.filter(
                characteristic => characteristic.category === workingMode
            )
        );

    const markingClassCharacteristics =
        availableMarkingCharacteristicsForWorkingMode.filter(
            characteristic =>
                characteristic.markingClass === selectedMarkingClass
        );

    const setCharacteristic = useDebouncedCallback(
        (id, value) =>
            MarkingCharacteristicsStore.actions.characteristics.setCharacteristic(
                id,
                value
            ),
        10
    );

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
                        <MousePointer
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
                        <Fingerprint
                            size={ICON.SIZE}
                            strokeWidth={ICON.STROKE_WIDTH}
                        />
                    </ToggleGroupItem>
                </ToggleGroup>
            </ToolbarGroup>

            <ToolbarGroup>
                {/* Selected characteristic and dropdown menu with existing characteristics */}
                <DropdownMenu>
                    <DropdownMenuTrigger
                        className={cn(
                            "w-36 overflow-hidden text-ellipsis whitespace-nowrap",
                            className
                        )}
                        disabled={!markingClassCharacteristics.length}
                    >
                        {selectedCharacteristic?.displayName}
                    </DropdownMenuTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuContent>
                            {markingClassCharacteristics.map(characteristic => (
                                <DropdownMenuItem
                                    key={characteristic.id}
                                    onClick={() => {
                                        MarkingCharacteristicsStore.actions.activeCharacteristics.setActiveCharacteristicByMarkingClass(
                                            selectedMarkingClass,
                                            characteristic.id,
                                            workingMode!
                                        );
                                    }}
                                >
                                    {characteristic.displayName}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenuPortal>
                </DropdownMenu>

                {/* Selected marking class e,g. point */}
                <ToggleGroup
                    type="single"
                    value={selectedCharacteristic?.markingClass ?? undefined}
                    variant="outline"
                    size="icon"
                >
                    <ToggleGroupItem
                        value={MARKING_CLASS.POINT}
                        title={`${t("Marking.Keys.markingClass.Keys.point", { ns: "object" })} (1)`}
                        disabled={
                            !availableMarkingCharacteristicsForWorkingMode.some(
                                x => x.markingClass === MARKING_CLASS.POINT
                            )
                        }
                        onClick={() => {
                            DashboardToolbarStore.actions.settings.marking.setSelectedMarkingClass(
                                MARKING_CLASS.POINT
                            );
                        }}
                    >
                        <Dot size={ICON.SIZE} strokeWidth={ICON.STROKE_WIDTH} />
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        value={MARKING_CLASS.RAY}
                        title={`${t("Marking.Keys.markingClass.Keys.ray", { ns: "object" })} (2)`}
                        onClick={() => {
                            DashboardToolbarStore.actions.settings.marking.setSelectedMarkingClass(
                                MARKING_CLASS.RAY
                            );
                        }}
                        disabled={
                            !availableMarkingCharacteristicsForWorkingMode.some(
                                x => x.markingClass === MARKING_CLASS.RAY
                            )
                        }
                    >
                        <DraftingCompass
                            size={ICON.SIZE}
                            strokeWidth={ICON.STROKE_WIDTH}
                        />
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        value={MARKING_CLASS.LINE_SEGMENT}
                        title={`${t("Marking.Keys.markingClass.Keys.line_segment", { ns: "object" })} (3)`}
                        onClick={() => {
                            DashboardToolbarStore.actions.settings.marking.setSelectedMarkingClass(
                                MARKING_CLASS.LINE_SEGMENT
                            );
                        }}
                        disabled={
                            !availableMarkingCharacteristicsForWorkingMode.some(
                                x =>
                                    x.markingClass ===
                                    MARKING_CLASS.LINE_SEGMENT
                            )
                        }
                    >
                        <Spline
                            size={ICON.SIZE}
                            strokeWidth={ICON.STROKE_WIDTH}
                        />
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        value={MARKING_CLASS.BOUNDING_BOX}
                        title={`${t("Marking.Keys.markingClass.Keys.bounding_box", { ns: "object" })} (4)`}
                        onClick={() => {
                            DashboardToolbarStore.actions.settings.marking.setSelectedMarkingClass(
                                MARKING_CLASS.BOUNDING_BOX
                            );
                        }}
                        disabled={
                            !availableMarkingCharacteristicsForWorkingMode.some(
                                x =>
                                    x.markingClass ===
                                    MARKING_CLASS.BOUNDING_BOX
                            )
                        }
                    >
                        <Square
                            size={ICON.SIZE}
                            strokeWidth={ICON.STROKE_WIDTH}
                        />
                    </ToggleGroupItem>
                </ToggleGroup>
            </ToolbarGroup>

            {/* Characteristics style e.g. color */}
            <ToolbarGroup>
                <Input
                    className="size-6 cursor-pointer"
                    title={`${t("MarkingCharacteristic.Keys.backgroundColor", { ns: "object" })}`}
                    type="color"
                    value={String(
                        selectedCharacteristic?.backgroundColor ??
                            defaultBackgroundColor
                    )}
                    disabled={!selectedCharacteristic}
                    onChange={e => {
                        setCharacteristic(selectedCharacteristic?.id, {
                            backgroundColor: e.target.value,
                        });
                    }}
                />
                <Input
                    className="size-6 cursor-pointer"
                    title={`${t("MarkingCharacteristic.Keys.textColor", { ns: "object" })}`}
                    type="color"
                    value={String(
                        selectedCharacteristic?.textColor ?? defaultTextColor
                    )}
                    disabled={!selectedCharacteristic}
                    onChange={e => {
                        setCharacteristic(selectedCharacteristic?.id, {
                            textColor: e.target.value,
                        });
                    }}
                />
                <Input
                    className="w-10 h-6 !p-0"
                    min={6}
                    max={32}
                    title={`${t("MarkingCharacteristic.Keys.size", { ns: "object" })}`}
                    type="number"
                    value={selectedCharacteristic?.size ?? defaultSize}
                    disabled={!selectedCharacteristic}
                    variant="outline"
                    onChange={e => {
                        setCharacteristic(selectedCharacteristic?.id, {
                            size: Number(e.target.value),
                        });
                    }}
                />
            </ToolbarGroup>

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
