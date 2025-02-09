/* eslint-disable no-param-reassign */
import { confirm } from "@tauri-apps/plugin-dialog";
import {
    CharacteristicKeybinding,
    _useKeybindingsStore,
} from "./Keybindings.store";

class StoreClass {
    readonly use = _useKeybindingsStore;

    get state() {
        return this.use.getState();
    }

    readonly actions = {
        characteristicsKeybindings: {
            add: async (keybinding: CharacteristicKeybinding) => {
                // Check if keybinding for key and working mode already exists
                const keybindingExists =
                    this.state.characteristicsKeybindings.some(
                        x =>
                            x.boundKey === keybinding.boundKey &&
                            x.workingMode === keybinding.workingMode
                    );

                // If key is already bound for this working mode, confirm
                if (keybindingExists) {
                    const confirmReplace = await confirm(
                        `Keybinding ${keybinding.boundKey} already exists. Do you want to replace it?`,
                        {
                            title: "Confirm Keybinding Override",
                            kind: "warning",
                        }
                    );

                    if (!confirmReplace) return;
                }

                // Update the state
                this.state.set(draft => {
                    draft.characteristicsKeybindings =
                        draft.characteristicsKeybindings.filter(
                            x =>
                                // Remove if characteristicId AND workingMode match
                                !(
                                    x.characteristicId ===
                                        keybinding.characteristicId &&
                                    x.workingMode === keybinding.workingMode
                                ) &&
                                // Remove if boundKey AND workingMode match
                                !(
                                    x.boundKey === keybinding.boundKey &&
                                    x.workingMode === keybinding.workingMode
                                )
                        );
                    draft.characteristicsKeybindings.push(keybinding);
                });
            },
            remove: (
                characteristicId: CharacteristicKeybinding["characteristicId"],
                mode: CharacteristicKeybinding["workingMode"]
            ) => {
                this.state.set(draft => {
                    // Remove all bindings for this characteristicId and mode
                    draft.characteristicsKeybindings =
                        draft.characteristicsKeybindings.filter(
                            x =>
                                x.characteristicId !== characteristicId ||
                                x.workingMode !== mode
                        );
                });
            },
        },
    };
}

const Store = new StoreClass();
export { Store as KeybindingsStore };
export { StoreClass as KeybindingsStoreClass };
