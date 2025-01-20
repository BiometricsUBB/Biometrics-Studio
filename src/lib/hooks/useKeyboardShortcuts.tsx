import { MARKING_TYPE } from "@/lib/markings/MarkingBase";
import { MarkingCharacteristicsStore } from "@/lib/stores/MarkingCharacteristics/MarkingCharacteristics";
import { WorkingModeStore } from "@/lib/stores/WorkingMode";
import {
    CURSOR_MODES,
    DashboardToolbarStore,
} from "../stores/DashboardToolbar";
import { CUSTOM_GLOBAL_EVENTS } from "../utils/const";
import { useKeyDown } from "./useKeyDown";

export const useKeyboardShortcuts = () => {
    const { actions } = DashboardToolbarStore;
    const {
        cursor: cursorActions,
        marking: markingActions,
        viewport: viewportActions,
    } = actions.settings;

    const { setSelectedMarkingType } = markingActions;
    const { setCursorMode } = cursorActions;
    const { toggleLockedViewport, toggleLockScaleSync } = viewportActions;
    const { workingMode } = WorkingModeStore.state;

    function isMarkingTypeAvailable(markingType: MARKING_TYPE) {
        return (
            MarkingCharacteristicsStore.state.characteristics.filter(
                characteristic =>
                    characteristic.category === workingMode &&
                    characteristic.type === markingType
            ).length > 0
        );
    }

    useKeyDown(() => {
        document.dispatchEvent(
            new Event(CUSTOM_GLOBAL_EVENTS.INTERRUPT_MARKING)
        );
    }, ["Escape"]);

    useKeyDown(() => {
        setCursorMode(CURSOR_MODES.SELECTION);
    }, ["F1"]);

    useKeyDown(() => {
        setCursorMode(CURSOR_MODES.MARKING);
    }, ["F2"]);

    useKeyDown(() => {
        if (!isMarkingTypeAvailable(MARKING_TYPE.POINT)) return;
        setSelectedMarkingType(MARKING_TYPE.POINT);
    }, ["1"]);

    useKeyDown(() => {
        if (!isMarkingTypeAvailable(MARKING_TYPE.RAY)) return;
        setSelectedMarkingType(MARKING_TYPE.RAY);
    }, ["2"]);

    useKeyDown(() => {
        if (!isMarkingTypeAvailable(MARKING_TYPE.LINE_SEGMENT)) return;
        setSelectedMarkingType(MARKING_TYPE.LINE_SEGMENT);
    }, ["3"]);

    useKeyDown(() => {
        toggleLockedViewport();
    }, ["l"]);

    useKeyDown(() => {
        toggleLockScaleSync();
    }, ["m"]);
};
