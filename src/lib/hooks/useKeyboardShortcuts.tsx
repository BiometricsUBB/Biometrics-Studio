import { MARKING_CLASS } from "@/lib/markings/MarkingBase";
import { WorkingModeStore } from "@/lib/stores/WorkingMode";
import { MarkingCharacteristicsStore } from "@/lib/stores/MarkingCharacteristics/MarkingCharacteristics";
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

    const { setSelectedMarkingClass } = markingActions;
    const { setCursorMode } = cursorActions;
    const { toggleLockedViewport, toggleLockScaleSync } = viewportActions;
    const { workingMode } = WorkingModeStore.state;

    function isMarkingClassAvailable(markingClass: MARKING_CLASS) {
        return (
            MarkingCharacteristicsStore.state.characteristics.filter(
                characteristic =>
                    characteristic.category === workingMode &&
                    characteristic.markingClass === markingClass
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
        if (!isMarkingClassAvailable(MARKING_CLASS.POINT)) return;
        setSelectedMarkingClass(MARKING_CLASS.POINT);
    }, ["1"]);

    useKeyDown(() => {
        if (!isMarkingClassAvailable(MARKING_CLASS.RAY)) return;
        setSelectedMarkingClass(MARKING_CLASS.RAY);
    }, ["2"]);

    useKeyDown(() => {
        if (!isMarkingClassAvailable(MARKING_CLASS.LINE_SEGMENT)) return;
        setSelectedMarkingClass(MARKING_CLASS.LINE_SEGMENT);
    }, ["3"]);

    useKeyDown(() => {
        if (!isMarkingClassAvailable(MARKING_CLASS.BOUNDING_BOX)) return;
        setSelectedMarkingClass(MARKING_CLASS.BOUNDING_BOX);
    }, ["4"]);

    useKeyDown(() => {
        toggleLockedViewport();
    }, ["l"]);

    useKeyDown(() => {
        toggleLockScaleSync();
    }, ["m"]);
};
