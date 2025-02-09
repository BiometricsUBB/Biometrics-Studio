import { KeybindingsStore } from "@/lib/stores/Keybindings";
import { useWorkingModeStore } from "@/lib/stores/WorkingMode";
import { MarkingCharacteristicsStore } from "@/lib/stores/MarkingCharacteristics/MarkingCharacteristics";
import { MARKING_CLASS } from "@/lib/markings/MarkingBase";
import {
    CURSOR_MODES,
    DashboardToolbarStore,
} from "../stores/DashboardToolbar";
import { CUSTOM_GLOBAL_EVENTS } from "../utils/const";
import { useKeyDown } from "./useKeyDown";

export const useKeyboardShortcuts = () => {
    const { actions } = DashboardToolbarStore;
    const { cursor: cursorActions, viewport: viewportActions } =
        actions.settings;

    const workingMode = useWorkingModeStore(state => state.workingMode);
    const keybindings = KeybindingsStore.use(state => state.keybindings);

    const { setActiveCharacteristicByMarkingClass } =
        MarkingCharacteristicsStore.actions.activeCharacteristics;

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

    const handleKeyDown = (key: string) => {
        const characteristicId = keybindings.find(
            binding =>
                binding.boundKey === key && binding.workingMode === workingMode
        )?.characteristicId;
        if (characteristicId && workingMode) {
            const markingCharacteristicExists =
                MarkingCharacteristicsStore.state.activeCharacteristics.some(
                    characteristic =>
                        characteristic.category === workingMode &&
                        characteristic.id === characteristicId
                );
            if (!markingCharacteristicExists) {
                KeybindingsStore.actions.removeKeybinding(
                    characteristicId,
                    workingMode
                );
            }

            setActiveCharacteristicByMarkingClass(
                MarkingCharacteristicsStore.state.characteristics.find(
                    characteristic =>
                        characteristic.id === characteristicId &&
                        characteristic.category === workingMode
                )?.markingClass as MARKING_CLASS,
                characteristicId,
                workingMode
            );
        }
    };

    useKeyDown(() => handleKeyDown("0"), ["0"]);
    useKeyDown(() => handleKeyDown("1"), ["1"]);
    useKeyDown(() => handleKeyDown("2"), ["2"]);
    useKeyDown(() => handleKeyDown("3"), ["3"]);
    useKeyDown(() => handleKeyDown("4"), ["4"]);
    useKeyDown(() => handleKeyDown("5"), ["5"]);
    useKeyDown(() => handleKeyDown("6"), ["6"]);
    useKeyDown(() => handleKeyDown("7"), ["7"]);
    useKeyDown(() => handleKeyDown("8"), ["8"]);
    useKeyDown(() => handleKeyDown("9"), ["9"]);

    useKeyDown(() => {
        toggleLockedViewport();
    }, ["l"]);

    useKeyDown(() => {
        toggleLockScaleSync();
    }, ["m"]);
};
