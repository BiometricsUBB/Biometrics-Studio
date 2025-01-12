/* eslint-disable no-param-reassign */
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
} from "lucide-react";
import { ICON } from "@/lib/utils/const";
import { MARKING_TYPE } from "@/lib/markings/MarkingBase";
import { useTranslation } from "react-i18next";
import { MarkingCharacteristicsStore } from "@/lib/stores/MarkingCharacteristics/MarkingCharacteristics";
import { useDebouncedCallback } from "use-debounce";
import { ToolbarGroup } from "./group";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { Input } from "../ui/input";

export type GlobalToolbarProps = HTMLAttributes<HTMLDivElement>;
export function GlobalToolbar({ className, ...props }: GlobalToolbarProps) {
    const { t } = useTranslation();

    const { mode: cursorMode } = DashboardToolbarStore.use(
        state => state.settings.cursor
    );
    const { locked: viewportLocked, scaleSync: viewportScaleSync } =
        DashboardToolbarStore.use(state => state.settings.viewport);

    const { toggleLockedViewport, toggleLockScaleSync } =
        DashboardToolbarStore.actions.settings.viewport;
    const { setCursorMode } = DashboardToolbarStore.actions.settings.cursor;

    const { type: selectedMarkingType } = DashboardToolbarStore.use(
        state => state.settings.marking
    );

    let selectedCharacteristic = MarkingCharacteristicsStore.use(
        state =>
            state.characteristics.find(x => x.type === selectedMarkingType)!
    );

    const { setSelectedMarkingType: _setSelectedMarkingType } =
        DashboardToolbarStore.actions.settings.marking;

    const setSelectedMarkingType = (type: MARKING_TYPE) => {
        _setSelectedMarkingType(type);
        selectedCharacteristic =
            MarkingCharacteristicsStore.actions.selectedCharacteristics.getSelectedCharacteristicByType(
                type
            );
    };

    const {
        setCharacteristicTextColor: _setCharacteristicTextColor,
        setCharacteristicSize: _setCharacteristicSize,
        setCharacteristicBackgroundColor: _setCharacteristicBackgroundColor,
    } = MarkingCharacteristicsStore.actions.characteristics;

    const setCharacteristicTextColor = useDebouncedCallback<
        typeof _setCharacteristicTextColor
    >((id, value) => _setCharacteristicTextColor(id, value), 10);

    const setCharacteristicSize = useDebouncedCallback<
        typeof _setCharacteristicSize
    >((id, value) => _setCharacteristicSize(id, value), 10);

    const setCharacteristicBackgroundColor = useDebouncedCallback<
        typeof _setCharacteristicBackgroundColor
    >((id, value) => _setCharacteristicBackgroundColor(id, value), 10);

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
                            setCursorMode(CURSOR_MODES.SELECTION);
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
                            setCursorMode(CURSOR_MODES.MARKING);
                        }}
                    >
                        <Fingerprint
                            size={ICON.SIZE}
                            strokeWidth={ICON.STROKE_WIDTH}
                        />
                    </ToggleGroupItem>
                </ToggleGroup>
            </ToolbarGroup>
            {/* TODO Dropdown with add/delete/rename/import features + styling */}
            <div style={{ width: 200, textAlign: "right" }}>
                <span>{selectedCharacteristic.name}</span>
            </div>

            {/* Selected marking type e,g. point */}
            <ToolbarGroup>
                <ToggleGroup
                    type="single"
                    value={selectedCharacteristic.type}
                    variant="outline"
                    size="icon"
                >
                    <ToggleGroupItem
                        value={MARKING_TYPE.POINT}
                        title={`${t("Marking.Keys.type.Keys.point", { ns: "object" })} (1)`}
                        onClick={() => {
                            setSelectedMarkingType(MARKING_TYPE.POINT);
                        }}
                    >
                        <Dot size={ICON.SIZE} strokeWidth={ICON.STROKE_WIDTH} />
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        value={MARKING_TYPE.RAY}
                        title={`${t("Marking.Keys.type.Keys.ray", { ns: "object" })} (2)`}
                        onClick={() => {
                            setSelectedMarkingType(MARKING_TYPE.RAY);
                        }}
                    >
                        <DraftingCompass
                            size={ICON.SIZE}
                            strokeWidth={ICON.STROKE_WIDTH}
                        />
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        value={MARKING_TYPE.LINE_SEGMENT}
                        title={`${t("Marking.Keys.type.Keys.line_segment", { ns: "object" })} (3)`}
                        onClick={() => {
                            setSelectedMarkingType(MARKING_TYPE.LINE_SEGMENT);
                        }}
                    >
                        <Spline
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
                    title={`${t("MarkingCharacteristic.Style.Keys.backgroundColor", { ns: "object" })}`}
                    type="color"
                    value={String(selectedCharacteristic.style.backgroundColor)}
                    onChange={e => {
                        setCharacteristicBackgroundColor(
                            selectedCharacteristic.id,
                            e.target.value
                        );
                    }}
                />
                <Input
                    className="size-6 cursor-pointer"
                    title={`${t("MarkingCharacteristic.Style.Keys.textColor", { ns: "object" })}`}
                    type="color"
                    value={String(selectedCharacteristic.style.textColor)}
                    onChange={e => {
                        setCharacteristicTextColor(
                            selectedCharacteristic.id,
                            e.target.value
                        );
                    }}
                />
                <Input
                    className="w-12 h-6 !p-0"
                    min={6}
                    max={32}
                    title={`${t("MarkingCharacteristic.Style.Keys.size", { ns: "object" })}`}
                    type="number"
                    value={selectedCharacteristic.style.size}
                    onChange={e => {
                        setCharacteristicSize(
                            selectedCharacteristic.id,
                            e.target.valueAsNumber
                        );
                    }}
                />
            </ToolbarGroup>

            {/* Additional tools */}
            <ToolbarGroup>
                <Toggle
                    variant="outline"
                    title={`${t("Lock viewports", { ns: "tooltip" })} (L)`}
                    size="icon"
                    pressed={viewportLocked}
                    onClick={toggleLockedViewport}
                >
                    {viewportLocked ? (
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
                    pressed={viewportScaleSync}
                    onClick={toggleLockScaleSync}
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
