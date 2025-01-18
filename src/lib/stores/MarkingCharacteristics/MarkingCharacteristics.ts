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
        activeCharacteristics: {
            setActiveCharacteristicByClass: (
                markingClass: MarkingCharacteristic["markingClass"],
                characteristicId: MarkingCharacteristic["id"]
            ) => {
                const newActiveCharacteristic = this.state.characteristics.find(
                    characteristic => characteristic.id === characteristicId
                );

                if (!newActiveCharacteristic) {
                    throw new Error(
                        `Characteristic with id ${characteristicId} not found`
                    );
                }

                this.state.set(draft => {
                    draft.activeCharacteristics =
                        draft.activeCharacteristics.map(characteristic =>
                            characteristic.markingClass === markingClass
                                ? newActiveCharacteristic
                                : characteristic
                        );
                });
            },
            getActiveCharacteristicByClass: (
                markingClass: MarkingCharacteristic["markingClass"]
            ) => {
                const characteristic = this.state.characteristics.find(
                    characteristic =>
                        characteristic.id ===
                        this.state.activeCharacteristics.find(
                            x => x.markingClass === markingClass
                        )!.id
                );

                if (!characteristic) {
                    throw new Error(
                        `Characteristic with markingClass ${markingClass} not found`
                    );
                }

                return characteristic;
            },
        },
        characteristics: {
            add: (characteristic: MarkingCharacteristic) => {
                this.state.set(draft => {
                    draft.characteristics.push(characteristic);
                });

                if (
                    !this.state.activeCharacteristics.find(
                        x => x.markingClass === characteristic.markingClass
                    )
                ) {
                    this.state.set(draft => {
                        draft.activeCharacteristics.push(characteristic);
                    });
                }
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

                    characteristics.forEach(characteristic => {
                        if (
                            !draft.activeCharacteristics.find(
                                x =>
                                    x.markingClass ===
                                    characteristic.markingClass
                            )
                        ) {
                            draft.activeCharacteristics.push(characteristic);
                        }
                    });
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
                const { markingClass } = this.state.characteristics.find(
                    c => c.id === characteristicId
                )!;

                this.state.set(draft => {
                    draft.characteristics = draft.characteristics.filter(
                        characteristic => characteristic.id !== characteristicId
                    );
                });

                this.state.set(draft => {
                    draft.activeCharacteristics =
                        draft.activeCharacteristics.filter(
                            characteristic =>
                                characteristic.id !== characteristicId
                        );

                    const activeCharacteristic = draft.characteristics.find(
                        x => x.markingClass === markingClass
                    );

                    if (activeCharacteristic) {
                        draft.activeCharacteristics =
                            draft.activeCharacteristics.concat([
                                activeCharacteristic,
                            ]);
                    }
                });
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

                this.state.set(draft => {
                    const activeCharacteristic =
                        draft.activeCharacteristics.find(
                            c => c.id === characteristicId
                        );
                    if (activeCharacteristic) {
                        Object.assign(activeCharacteristic, newValues);
                    }
                });
            },
        },
    };
}

const Store = new StoreClass();
export { Store as MarkingCharacteristicsStore };
export { type StoreClass as MarkingCharacteristicsStoreClass };
