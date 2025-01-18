import { MARKING_CLASS } from "@/lib/markings/MarkingBase";
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
        setSelectedMarkingClass(MARKING_CLASS.POINT);
    }, ["1"]);

    useKeyDown(() => {
        setSelectedMarkingClass(MARKING_CLASS.RAY);
    }, ["2"]);

    useKeyDown(() => {
        setSelectedMarkingClass(MARKING_CLASS.LINE_SEGMENT);
    }, ["3"]);

    useKeyDown(() => {
        toggleLockedViewport();
    }, ["l"]);

    useKeyDown(() => {
        toggleLockScaleSync();
    }, ["m"]);
};
