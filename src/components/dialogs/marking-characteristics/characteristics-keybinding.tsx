import React from "react";
import { KeybindingsStore } from "@/lib/stores/Keybindings";
import { MarkingCharacteristic } from "@/lib/markings/MarkingCharacteristic";
import { WORKING_MODE } from "@/views/selectMode";
import KeyCaptureDialog from "@/components/ui/key-capture-dialog";

interface CharacteristicsKeyCaptureDialogProps {
    mode: WORKING_MODE;
    boundKey: string | undefined;
    characteristicId: MarkingCharacteristic["id"];
}

function CharacteristicsKeybinding({
    mode,
    boundKey,
    characteristicId,
}: CharacteristicsKeyCaptureDialogProps) {
    const { add, remove } = KeybindingsStore.actions.characteristicsKeybindings;

    const validateKey = (key: string) => {
        if (!/^[0-9]$/.test(key)) {
            return `'${key}' is not a digit`;
        }
        return undefined;
    };

    const handleKeyBind = (key: string) => {
        add({
            workingMode: mode,
            boundKey: key,
            characteristicId,
        });
    };

    const handleKeyUnbind = () => {
        remove(characteristicId, mode);
    };

    return (
        <KeyCaptureDialog
            boundKey={boundKey}
            validateKey={validateKey}
            onKeyBind={handleKeyBind}
            onKeyUnbind={handleKeyUnbind}
            dialogTitle={
                <>
                    <span>Press a digit (0-9)</span>
                    <br />
                    <span>Press Del to remove keybinding</span>
                </>
            }
        />
    );
}

export default CharacteristicsKeybinding;
