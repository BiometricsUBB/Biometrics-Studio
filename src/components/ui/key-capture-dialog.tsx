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

function KeyCaptureDialog() {
    const [capturedKey, setCapturedKey] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState("");
    const [isShaking, setIsShaking] = useState(false);

    const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
        const { key } = event;
        if (/^[0-9]$/.test(key)) {
            setCapturedKey(key);
            setIsOpen(false);
            setError("");
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
                    setCapturedKey(null);
                    setError("");
                }}
            >
                {capturedKey ?? "1"}
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
                    <DialogTitle>Press a digit (0-9)</DialogTitle>

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
