import React from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/hooks/useTheme";
import { THEMES } from "@/lib/stores/GlobalSettings";
import { cn } from "@/lib/utils/shadcn";
import { Check, Sun, Moon, Monitor } from "lucide-react";
import { emitSettingsChange } from "@/lib/hooks/useSettingsSync";

const themeIcons: Record<THEMES, React.ReactNode> = {
    [THEMES.LIGHT]: <Sun size={18} />,
    [THEMES.DARK]: <Moon size={18} />,
    [THEMES.SYSTEM]: <Monitor size={18} />,
};

export function ThemeSettings() {
    const { t } = useTranslation();
    const { theme: resolvedTheme, setTheme } = useTheme();

    const handleThemeChange = async (value: THEMES) => {
        setTheme(value);
        await emitSettingsChange({ type: "theme", value });
    };

    return (
        <div className="flex flex-col gap-4">
            <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">
                    {t("Theme")}
                </h2>
                <p className="text-sm text-muted-foreground">
                    {t("Select your preferred theme", { ns: "description" })}
                </p>
            </div>

            <div className="flex flex-col gap-2">
                {(Object.keys(THEMES) as (keyof typeof THEMES)[]).map(key => {
                    // eslint-disable-next-line security/detect-object-injection
                    const value = THEMES[key];
                    const isSelected = resolvedTheme === value;

                    return (
                        <button
                            type="button"
                            key={key}
                            onClick={() => handleThemeChange(value)}
                            className={cn(
                                "flex items-center justify-between px-4 py-3 rounded-lg transition-all",
                                "border hover:bg-primary/10",
                                isSelected
                                    ? "bg-primary/20 border-primary/50"
                                    : "border-border/30"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-foreground/70">
                                    {themeIcons[value]}
                                </span>
                                <span className="text-sm font-medium text-foreground">
                                    {t(`Theme.Keys.${value}`, { ns: "object" })}
                                </span>
                            </div>
                            {isSelected && (
                                <Check size={18} className="text-primary" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
