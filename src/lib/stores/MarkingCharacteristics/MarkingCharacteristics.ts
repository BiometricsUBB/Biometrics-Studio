/* eslint-disable no-param-reassign */

import { MarkingCharacteristic } from "@/lib/markings/MarkingCharacteristic";
import { _useMarkingCharacteristicsStore as useStore } from "./MarkingCharacteristics.store";

class StoreClass {
    readonly use = useStore;

    get state() {
        return this.use.getState();
    }

    readonly actions = {
        selectedCharacteristics: {
            setSelectedCharacteristicByType: (
                type: MarkingCharacteristic["type"],
                characteristicId: MarkingCharacteristic["id"]
            ) => {
                if (
                    !this.state.characteristics.find(
                        characteristic => characteristic.id === characteristicId
                    )
                ) {
                    throw new Error(
                        `Characteristic with id ${characteristicId} not found`
                    );
                }

                this.state.set(draft => {
                    draft.selectedCharacteristics =
                        draft.selectedCharacteristics.map(x =>
                            x.type === type ? { ...x, id: characteristicId } : x
                        );
                });
            },
            getSelectedCharacteristicByType: (
                type: MarkingCharacteristic["type"]
            ) => {
                const characteristic = this.state.characteristics.find(
                    characteristic =>
                        characteristic.id ===
                        this.state.selectedCharacteristics.find(
                            x => x.type === type
                        )!.id
                );

                if (!characteristic) {
                    throw new Error(
                        `Characteristic with type ${type} not found`
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
            },
            removeById: (characteristicId: MarkingCharacteristic["id"]) => {
                this.state.set(draft => {
                    draft.characteristics = draft.characteristics.filter(
                        characteristic => characteristic.id !== characteristicId
                    );
                });
            },
            setCharacteristicSize: (
                characteristicId: MarkingCharacteristic["id"],
                size: MarkingCharacteristic["style"]["size"]
            ) => {
                this.state.set(draft => {
                    const characteristic = draft.characteristics.find(
                        c => c.id === characteristicId
                    );
                    if (characteristic) {
                        characteristic.style.size = size;
                    }
                });
            },
            setCharacteristicBackgroundColor: (
                characteristicId: MarkingCharacteristic["id"],
                color: MarkingCharacteristic["style"]["backgroundColor"]
            ) => {
                this.state.set(draft => {
                    const characteristic = draft.characteristics.find(
                        c => c.id === characteristicId
                    );
                    if (characteristic) {
                        characteristic.style.backgroundColor = color;
                    }
                });
            },
            setCharacteristicTextColor: (
                characteristicId: MarkingCharacteristic["id"],
                color: MarkingCharacteristic["style"]["textColor"]
            ) => {
                this.state.set(draft => {
                    const characteristic = draft.characteristics.find(
                        c => c.id === characteristicId
                    );
                    if (characteristic) {
                        characteristic.style.textColor = color;
                    }
                });
            },
        },
    };
}

const Store = new StoreClass();
export { Store as MarkingCharacteristicsStore };
export { type StoreClass as MarkingCharacteristicsStoreClass };
