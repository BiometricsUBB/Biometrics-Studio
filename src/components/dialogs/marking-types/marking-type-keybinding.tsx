import React from "react";
import { KeybindingsStore } from "@/lib/stores/Keybindings";
import { MarkingType } from "@/lib/markings/MarkingType";
import { WORKING_MODE } from "@/views/selectMode";
import KeyCaptureDialog from "@/components/ui/key-capture-dialog";
import { useTranslation } from "react-i18next";

interface TypesKeyCaptureDialogProps {
    workingMode: WORKING_MODE;
    boundKey: string | undefined;
    typeId: MarkingType["id"];
}

function MarkingTypeKeybinding({
    workingMode,
    boundKey,
    typeId,
}: TypesKeyCaptureDialogProps) {
    const { t } = useTranslation();

    const { add, remove } = KeybindingsStore.actions.typesKeybindings;

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
            workingMode,
            boundKey: key,
            typeId,
        });
    };

    const handleKeyUnbind = () => {
        remove(typeId, workingMode);
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

export default MarkingTypeKeybinding;
