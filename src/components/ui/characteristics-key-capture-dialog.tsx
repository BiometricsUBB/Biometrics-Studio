import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogOverlay,
    DialogPortal,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils/shadcn";
import { KeybindingsStore } from "@/lib/stores/Keybindings";
import { MarkingCharacteristic } from "@/lib/markings/MarkingCharacteristic";
import { WORKING_MODE } from "@/views/selectMode";

interface KeyCaptureDialogProps {
    mode: WORKING_MODE;
    boundKey: string | undefined;
    characteristicId: MarkingCharacteristic["id"];
}

function CharacteristicsKeyCaptureDialog({
    mode,
    boundKey,
    characteristicId,
}: KeyCaptureDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState("");
    const [isShaking, setIsShaking] = useState(false);
    const { add, remove } = KeybindingsStore.actions.characteristicsKeybindings;

    const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
        const { key } = event;
        if (/^[0-9]$/.test(key)) {
            setIsOpen(false);
            setError("");
            add({
                workingMode: mode,
                boundKey: key,
                characteristicId,
            });
        } else if (key === "Delete") {
            setIsOpen(false);
            setError("");
            remove(characteristicId, mode);
        } else {
            setError(`'${key}' is not a digit`);
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger
                title="Keybinding"
                className={cn("m-auto")}
                onClick={() => {
                    setIsOpen(true);
                    setError("");
                }}
            >
                {boundKey ?? "none"}
            </DialogTrigger>

            <DialogPortal>
                <DialogOverlay />
                <DialogContent
                    className={cn(
                        "p-6 outline-none",
                        isShaking && "shake-animation"
                    )}
                    onKeyDown={handleKeyPress}
                    tabIndex={-1}
                >
                    <DialogTitle>
                        <span>Press a digit (0-9)</span>
                        <br />
                        <span>Press Del to remove keybinding</span>
                    </DialogTitle>

                    {error && (
                        <div
                            className="text-destructive text-center"
                            aria-live="polite"
                        >
                            {error}
                        </div>
                    )}
                </DialogContent>
            </DialogPortal>
        </Dialog>
    );
}

export default CharacteristicsKeyCaptureDialog;
