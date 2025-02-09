/* eslint-disable no-param-reassign */

import { MarkingCharacteristic } from "@/lib/markings/MarkingCharacteristic";
import { MarkingsStore } from "@/lib/stores/Markings";
import { CANVAS_ID } from "@/components/pixi/canvas/hooks/useCanvasContext";
import { _useMarkingCharacteristicsStore as useStore } from "./MarkingCharacteristics.store";

class StoreClass {
    readonly use = useStore;

    get state() {
        return this.use.getState();
    }

    readonly actions = {
        selectedCharacteristic: {
            set: (characteristicId: MarkingCharacteristic["id"] | null) => {
                if (
                    characteristicId &&
                    !this.state.characteristics.some(
                        characteristic => characteristic.id === characteristicId
                    )
                ) {
                    return;
                }

                this.state.set(draft => {
                    draft.selectedCharacteristicId = characteristicId;
                });
            },
            get: () =>
                this.state.characteristics.find(
                    characteristic =>
                        characteristic.id ===
                        this.state.selectedCharacteristicId
                ),
        },
        characteristics: {
            add: (characteristic: MarkingCharacteristic) => {
                this.state.set(draft => {
                    draft.characteristics.push(characteristic);
                });
            },
            getConflicts: (characteristics: MarkingCharacteristic[]) => {
                return this.state.characteristics.filter(characteristic =>
                    characteristics.some(
                        existingCharacteristic =>
                            existingCharacteristic.id === characteristic.id
                    )
                );
            },
            addMany: (characteristics: MarkingCharacteristic[]) => {
                this.state.set(draft => {
                    // Remove existing characteristics that are in the passed array
                    draft.characteristics = draft.characteristics.filter(
                        characteristic =>
                            !characteristics.some(
                                c => c.id === characteristic.id
                            )
                    );

                    // Add the passed characteristics
                    draft.characteristics =
                        draft.characteristics.concat(characteristics);
                });
            },
            checkIfCharacteristicIsInUse: (
                characteristicId: MarkingCharacteristic["id"],
                canvasId: CANVAS_ID
            ) =>
                MarkingsStore(canvasId).state.markings.some(
                    marking => marking.characteristicId === characteristicId
                ),
            removeById: (characteristicId: MarkingCharacteristic["id"]) => {
                this.state.set(draft => {
                    draft.characteristics = draft.characteristics.filter(
                        characteristic => characteristic.id !== characteristicId
                    );
                });

                this.actions.selectedCharacteristic.set(null);
            },
            setCharacteristic: (
                characteristicId: MarkingCharacteristic["id"],
                newValues: Partial<MarkingCharacteristic>
            ) => {
                this.state.set(draft => {
                    const characteristic = draft.characteristics.find(
                        c => c.id === characteristicId
                    );
                    if (characteristic) {
                        Object.assign(characteristic, newValues);
                    }
                });
            },
        },
    };
}

const Store = new StoreClass();
export { Store as MarkingCharacteristicsStore };
export { type StoreClass as MarkingCharacteristicsStoreClass };
