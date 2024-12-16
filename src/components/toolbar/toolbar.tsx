/* eslint-disable no-param-reassign */
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils/shadcn";
import { HTMLAttributes } from "react";
import { useDebouncedCallback } from "use-debounce";
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
import { ToolbarGroup } from "./group";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { Input } from "../ui/input";

export type GlobalToolbarProps = HTMLAttributes<HTMLDivElement>;
export function GlobalToolbar({ className, ...props }: GlobalToolbarProps) {
    const { t } = useTranslation();

    const { cursor, marking, viewport } = DashboardToolbarStore.use(
        state => state.settings
    );

    const {
        cursor: cursorActions,
        viewport: viewportActions,
        marking: markingActions,
    } = DashboardToolbarStore.actions.settings;

    const { toggleLockedViewport, toggleLockScaleSync } = viewportActions;
    const { setCursorMode } = cursorActions;
    const {
        setMarkingSize,
        setMarkingType,
        setMarkingBackgroundColor: _setMarkingBackgroundColor,
        setMarkingTextColor: _setMarkingTextColor,
    } = markingActions;

    const setMarkingBackgroundColor = useDebouncedCallback<
        typeof _setMarkingBackgroundColor
    >(value => _setMarkingBackgroundColor(value), 10);

    const setMarkingTextColor = useDebouncedCallback<
        typeof _setMarkingTextColor
    >(value => _setMarkingTextColor(value), 10);

    return (
        <div
            className={cn(
                "flex items-center gap-2 py-0.5 justify-center w-fit h-fit rounded-md",
                className
            )}
            {...props}
        >
            <ToolbarGroup>
                <ToggleGroup
                    type="single"
                    value={cursor.mode}
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
            <ToolbarGroup>
                <ToggleGroup
                    type="single"
                    value={marking.type}
                    variant="outline"
                    size="icon"
                >
                    <ToggleGroupItem
                        value={MARKING_TYPE.POINT}
                        title={`${t("Marking.Keys.type.Keys.point", { ns: "object" })} (1)`}
                        onClick={() => {
                            setMarkingType(MARKING_TYPE.POINT);
                        }}
                    >
                        <Dot size={ICON.SIZE} strokeWidth={ICON.STROKE_WIDTH} />
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        value={MARKING_TYPE.RAY}
                        title={`${t("Marking.Keys.type.Keys.ray", { ns: "object" })} (2)`}
                        onClick={() => {
                            setMarkingType(MARKING_TYPE.RAY);
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
                            setMarkingType(MARKING_TYPE.LINE_SEGMENT);
                        }}
                    >
                        <Spline
                            size={ICON.SIZE}
                            strokeWidth={ICON.STROKE_WIDTH}
                        />
                    </ToggleGroupItem>
                </ToggleGroup>
            </ToolbarGroup>
            <ToolbarGroup>
                <Input
                    className="size-6 cursor-pointer"
                    title={`${t("Marking.Keys.backgroundColor", { ns: "object" })}`}
                    type="color"
                    value={marking.backgroundColor}
                    onChange={e => {
                        setMarkingBackgroundColor(e.target.value);
                    }}
                />
                <Input
                    className="size-6 cursor-pointer"
                    title={`${t("Marking.Keys.textColor", { ns: "object" })}`}
                    type="color"
                    value={marking.textColor}
                    onChange={e => {
                        setMarkingTextColor(e.target.value);
                    }}
                />
                <Input
                    className="w-12 h-6 !p-0"
                    min={6}
                    max={32}
                    title={`${t("Marking.Keys.size", { ns: "object" })}`}
                    type="number"
                    value={marking.size}
                    onChange={e => {
                        setMarkingSize(e.target.valueAsNumber);
                    }}
                />
            </ToolbarGroup>
            <ToolbarGroup>
                <Toggle
                    variant="outline"
                    title={`${t("Lock viewports", { ns: "tooltip" })} (L)`}
                    size="icon"
                    pressed={viewport.locked}
                    onClick={toggleLockedViewport}
                >
                    {viewport.locked ? (
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
                    pressed={viewport.scaleSync}
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
