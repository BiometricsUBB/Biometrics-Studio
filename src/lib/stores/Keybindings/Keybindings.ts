/* eslint-disable no-param-reassign */
import { confirm } from "@tauri-apps/plugin-dialog";
import {
    Keybinding,
    _useKeybindingStore as useStore,
} from "./Keybindings.store";

class StoreClass {
    readonly use = useStore;

    get state() {
        return this.use.getState();
    }

    readonly actions = {
        addKeybinding: async (keybinding: Keybinding) => {
            // Check if keybinding for key and working mode already exists
            const exists = this.state.keybindings.some(
                x =>
                    x.boundKey === keybinding.boundKey &&
                    x.workingMode === keybinding.workingMode
            );

            // If key is already bound for this working mode, confirm
            if (exists) {
                const confirmReplace = await confirm(
                    `Keybinding ${keybinding.boundKey} already exists. Do you want to replace it?`,
                    { title: "Confirm Keybinding Override", kind: "warning" }
                );

                if (!confirmReplace) return;
            }

            // Update the state
            this.state.set(draft => {
                draft.keybindings = draft.keybindings.filter(
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
                draft.keybindings.push(keybinding);
            });
        },
        removeKeybinding: (
            characteristicId: Keybinding["characteristicId"],
            mode: Keybinding["workingMode"]
        ) => {
            this.state.set(draft => {
                // Remove all bindings for this characteristicId and mode
                draft.keybindings = draft.keybindings.filter(
                    x =>
                        x.characteristicId !== characteristicId ||
                        x.workingMode !== mode
                );
            });
        },
    };
}

const Store = new StoreClass();
export { Store as KeybindingsStore };
export { StoreClass as KeybindingsStoreClass };
