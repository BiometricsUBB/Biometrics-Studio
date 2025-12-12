import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { WindowControls } from "@/components/menu/window-controls";
import { Menubar } from "@/components/ui/menubar";
import { cn } from "@/lib/utils/shadcn";
import { ICON } from "@/lib/utils/const";
import { Languages, Palette, Info, Settings } from "lucide-react";
import { CustomThemeStore } from "@/lib/stores/CustomTheme";
import { applyCustomTheme } from "@/lib/hooks/useCustomTheme";
import { LanguageSettings } from "./categories/language-settings";
import { ThemeSettings } from "./categories/theme-settings";
import { AboutSettings } from "./categories/about-settings";

enum SETTINGS_CATEGORY {
    LANGUAGE = "language",
    THEME = "theme",
    ABOUT = "about",
}

interface CategoryItem {
    id: SETTINGS_CATEGORY;
    labelKey: "Language" | "Theme" | "About";
    icon: React.ReactNode;
}

const categories: CategoryItem[] = [
    {
        id: SETTINGS_CATEGORY.LANGUAGE,
        labelKey: "Language",
        icon: <Languages size={ICON.SIZE} strokeWidth={ICON.STROKE_WIDTH} />,
    },
    {
        id: SETTINGS_CATEGORY.THEME,
        labelKey: "Theme",
        icon: <Palette size={ICON.SIZE} strokeWidth={ICON.STROKE_WIDTH} />,
    },
    {
        id: SETTINGS_CATEGORY.ABOUT,
        labelKey: "About",
        icon: <Info size={ICON.SIZE} strokeWidth={ICON.STROKE_WIDTH} />,
    },
];

export function SettingsWindow() {
    const { t } = useTranslation();
    const [activeCategory, setActiveCategory] = useState<SETTINGS_CATEGORY>(
        SETTINGS_CATEGORY.LANGUAGE
    );

    useEffect(() => {
        const init = async () => {
            await CustomThemeStore.rehydrate();
            const activeTheme = CustomThemeStore.getActiveTheme();
            if (activeTheme) {
                applyCustomTheme(activeTheme);
            }
        };
        init();
    }, []);

    const renderCategoryContent = () => {
        switch (activeCategory) {
            case SETTINGS_CATEGORY.LANGUAGE:
                return <LanguageSettings />;
            case SETTINGS_CATEGORY.THEME:
                return <ThemeSettings />;
            case SETTINGS_CATEGORY.ABOUT:
                return <AboutSettings />;
            default:
                return null;
        }
    };

    return (
        <main
            data-testid="settings-window"
            className="flex w-full min-h-dvh h-full flex-col items-center justify-between bg-[hsl(var(--background))] relative overflow-hidden"
        >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[75%] h-[85%] brightness-150 rounded-2xl bg-primary/20 blur-[150px]" />
            </div>

            <Menubar
                className={cn(
                    "flex justify-between w-screen items-center min-h-[56px]"
                )}
                data-tauri-drag-region
            >
                <div className="flex grow-1 items-center">
                    <div className="flex items-center px-2">
                        <Settings
                            size={ICON.SIZE}
                            strokeWidth={ICON.STROKE_WIDTH}
                            className="text-foreground"
                        />
                    </div>
                    <span className="text-sm font-medium text-foreground">
                        {t("Settings", { ns: "keywords" })}
                    </span>
                </div>
                <WindowControls />
            </Menubar>

            <div className="flex flex-1 w-full overflow-hidden p-2 gap-2">
                <div className="w-1/3 flex flex-col gap-1">
                    {categories.map(category => (
                        <button
                            type="button"
                            key={category.id}
                            onClick={() => setActiveCategory(category.id)}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left",
                                "hover:bg-primary/10",
                                activeCategory === category.id
                                    ? "bg-primary/20 text-primary-foreground border border-primary/30"
                                    : "text-foreground/80"
                            )}
                        >
                            {category.icon}
                            <span className="text-sm font-medium">
                                {t(category.labelKey)}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="w-2/3 bg-background/70 backdrop-blur-sm border border-border/30 rounded-xl p-4 overflow-y-auto">
                    {renderCategoryContent()}
                </div>
            </div>
        </main>
    );
}
