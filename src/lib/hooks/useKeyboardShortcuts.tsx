import { KeybindingsStore } from "@/lib/stores/Keybindings";
import { useWorkingModeStore } from "@/lib/stores/WorkingMode";
import { MarkingCharacteristicsStore } from "@/lib/stores/MarkingCharacteristics/MarkingCharacteristics";
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
    const keybindings = KeybindingsStore.use(
        state => state.characteristicsKeybindings
    );

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
            keybinding =>
                keybinding.boundKey === key &&
                keybinding.workingMode === workingMode
        )?.characteristicId;

        if (characteristicId && workingMode) {
            const characteristicExists =
                MarkingCharacteristicsStore.state.characteristics.some(
                    characteristic =>
                        characteristic.id === characteristicId &&
                        characteristic.category === workingMode
                );

            if (!characteristicExists) {
                KeybindingsStore.actions.characteristicsKeybindings.remove(
                    characteristicId,
                    workingMode
                );
                return;
            }

            MarkingCharacteristicsStore.actions.selectedCharacteristic.set(
                characteristicId
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
