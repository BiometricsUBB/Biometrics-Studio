import React from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Separator } from "@/components/ui/separator";
import { useLocalStorage } from "@/lib/hooks/useLocalStorage";

export enum WORKING_MODE {
    FINGERPRINT = "FINGERPRINT",
    EAR = "EAR",
    SHOE_PRINT = "SHOE_PRINT",
}

export default function SelectMode() {
    const { t } = useTranslation();
    const [, setCurrentWorkingMode] = useLocalStorage("working_mode", "");

    return (
        <main className="w-full flex flex-col items-center justify-center">
            <div
                className="absolute inset-0 top-2 bg-cover bg-center z-0 blur-sm"
                aria-hidden="true"
            />
            <div className="bg-background border z-10 p-4 shadow-md">
                <h1 className="text-2xl text-center font-bold text-foreground">
                    {t("Biometrics Studio")}
                </h1>
                <Separator />
                <p className="text-xs text-center text-muted-foreground">
                    {t("Please select your working mode")}
                </p>
                <div className="flex flex-col gap-2 mt-6">
                    {Object.values(WORKING_MODE).map(mode => (
                        <Button
                            key={mode}
                            onClick={() => {
                                setCurrentWorkingMode(mode);
                            }}
                        >
                            {mode}
                        </Button>
                    ))}
                </div>
            </div>
        </main>
    );
}
