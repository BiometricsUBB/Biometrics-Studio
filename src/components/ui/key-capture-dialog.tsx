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
import { useTranslation } from "react-i18next";

interface KeyCaptureDialogProps {
    // Current bound key to display
    boundKey?: string;

    // Custom validation function that returns error message if invalid
    validateKey?: (key: string) => string | undefined;

    // Handlers for key operations
    onKeyBind?: (key: string) => void | Promise<void>;
    onKeyUnbind?: () => void | Promise<void>;

    // Optional custom trigger and title content
    triggerContent?: React.ReactNode;
    dialogTitle?: React.ReactNode;

    // Optional className for trigger button
    triggerClassName?: string;
}

function KeyCaptureDialog({
    boundKey,
    validateKey = () => undefined,
    onKeyBind,
    onKeyUnbind,
    triggerContent,
    dialogTitle,
    triggerClassName,
}: KeyCaptureDialogProps) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState("");
    const [isShaking, setIsShaking] = useState(false);

    const handleKeyPress = async (
        event: React.KeyboardEvent<HTMLDivElement>
    ) => {
        const { key } = event;

        if (key === "Delete" && onKeyUnbind) {
            await onKeyUnbind();
            setIsOpen(false);
            setError("");
            return;
        }

        const validationError = validateKey(key);
        if (validationError) {
            setError(validationError);
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500);
            return;
        }

        if (onKeyBind) {
            await onKeyBind(key);
            setIsOpen(false);
            setError("");
        }
    };

    const defaultTitle = (
        <>
            <span>{t("Press a key", { ns: "keybindings" })}</span>
            {onKeyUnbind && (
                <>
                    <br />
                    <span>
                        {t("Press 'Del' to remove keybinding", {
                            ns: "keybindings",
                        })}
                    </span>
                </>
            )}
        </>
    );

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger
                title="Keybinding"
                className={cn("m-auto", triggerClassName)}
                onClick={() => {
                    setIsOpen(true);
                    setError("");
                }}
            >
                {triggerContent ?? boundKey ?? "none"}
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
                    <DialogTitle>{dialogTitle ?? defaultTitle}</DialogTitle>

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

export default KeyCaptureDialog;
