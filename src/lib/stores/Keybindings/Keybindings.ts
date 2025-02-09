/* eslint-disable no-param-reassign */
import { confirm } from "@tauri-apps/plugin-dialog";
import { _useKeybindingsStore, TypeKeybinding } from "./Keybindings.store";

class StoreClass {
    readonly use = _useKeybindingsStore;

    get state() {
        return this.use.getState();
    }

    readonly actions = {
        typesKeybindings: {
            add: async (keybinding: TypeKeybinding) => {
                // Check if keybinding for key and working mode already exists
                const keybindingExists = this.state.typesKeybindings.some(
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
                    draft.typesKeybindings = draft.typesKeybindings.filter(
                        x =>
                            // Remove if typeId AND workingMode match
                            !(
                                x.typeId === keybinding.typeId &&
                                x.workingMode === keybinding.workingMode
                            ) &&
                            // Remove if boundKey AND workingMode match
                            !(
                                x.boundKey === keybinding.boundKey &&
                                x.workingMode === keybinding.workingMode
                            )
                    );
                    draft.typesKeybindings.push(keybinding);
                });
            },
            remove: (
                typeId: TypeKeybinding["typeId"],
                mode: TypeKeybinding["workingMode"]
            ) => {
                this.state.set(draft => {
                    // Remove all bindings for this typeId and mode
                    draft.typesKeybindings = draft.typesKeybindings.filter(
                        x => x.typeId !== typeId || x.workingMode !== mode
                    );
                });
            },
        },
    };
}

const Store = new StoreClass();
export { Store as KeybindingsStore };
export { StoreClass as KeybindingsStoreClass };
