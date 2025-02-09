import React from "react";
import { KeybindingsStore } from "@/lib/stores/Keybindings";
import { MarkingCharacteristic } from "@/lib/markings/MarkingCharacteristic";
import { WORKING_MODE } from "@/views/selectMode";
import KeyCaptureDialog from "@/components/ui/key-capture-dialog";
import { useTranslation } from "react-i18next";

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
    const { t } = useTranslation();

    const { add, remove } = KeybindingsStore.actions.characteristicsKeybindings;

    const validateKey = (key: string) => {
        if (!/^[0-9]$/.test(key)) {
            return t("'{{key}}' is not a  numeric key", {
                ns: "keybindings",
                key,
            });
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
                    <span>
                        {t("Press a numeric key (0-9)", { ns: "keybindings" })}
                    </span>
                    <br />
                    <span>
                        {t("Press 'Del' to remove keybinding", {
                            ns: "keybindings",
                        })}
                    </span>
                </>
            }
        />
    );
}

export default CharacteristicsKeybinding;
