import {
    MenubarCheckboxItem,
    MenubarContent,
    MenubarMenu,
    MenubarPortal,
    MenubarSub,
    MenubarSubContent,
    MenubarSubTrigger,
    MenubarTrigger,
} from "@/components/ui/menubar";
import {
    GlobalSettingsStore,
    LANGUAGES,
    PRERENDER_RADIUS_OPTIONS,
    THEMES,
} from "@/lib/stores/GlobalSettings";
import i18n from "@/lib/locales/i18n";
import { useEffect } from "react";
import { useTheme } from "@/lib/hooks/useTheme";
import { Menu as MenuIcon } from "lucide-react";
import { ICON } from "@/lib/utils/const";
import { useTranslation } from "react-i18next";

export function SettingsMenu() {
    const { t } = useTranslation();
    const { theme: resolvedTheme, setTheme } = useTheme();
    const { setTheme: setStoreTheme } =
        GlobalSettingsStore.actions.settings.interface;

    const { video } = GlobalSettingsStore.use(state => state.settings);

    useEffect(() => {
        setStoreTheme(resolvedTheme as THEMES);
    }, [resolvedTheme, setStoreTheme]);

    return (
        <MenubarMenu>
            <MenubarTrigger>
                <MenuIcon size={ICON.SIZE} strokeWidth={ICON.STROKE_WIDTH} />
            </MenubarTrigger>
            <MenubarPortal>
                <MenubarContent>
                    <MenubarSub>
                        <MenubarSubTrigger>
                            {t("PrerenderingRadius.Name", { ns: "object" })}
                        </MenubarSubTrigger>
                        <MenubarSubContent>
                            {(
                                Object.keys(
                                    PRERENDER_RADIUS_OPTIONS
                                ) as (keyof typeof PRERENDER_RADIUS_OPTIONS)[]
                            ).map(key => {
                                // eslint-disable-next-line security/detect-object-injection
                                const value = PRERENDER_RADIUS_OPTIONS[key];
                                return (
                                    <MenubarCheckboxItem
                                        key={key}
                                        checked={
                                            video.rendering.prerenderRadius ===
                                            value
                                        }
                                        onCheckedChange={() =>
                                            GlobalSettingsStore.actions.settings.video.setPrerenderRadius(
                                                value
                                            )
                                        }
                                    >
                                        {t(`PrerenderingRadius.Keys.${value}`, {
                                            ns: "object",
                                        })}
                                    </MenubarCheckboxItem>
                                );
                            })}
                        </MenubarSubContent>
                    </MenubarSub>

                    <MenubarSub>
                        <MenubarSubTrigger>{t("Language")}</MenubarSubTrigger>
                        <MenubarSubContent>
                            {(
                                Object.keys(
                                    LANGUAGES
                                ) as (keyof typeof LANGUAGES)[]
                            ).map(key => {
                                // eslint-disable-next-line security/detect-object-injection
                                const value = LANGUAGES[key];
                                return (
                                    <MenubarCheckboxItem
                                        key={key}
                                        checked={i18n.language === value}
                                        onCheckedChange={() =>
                                            i18n.changeLanguage(value)
                                        }
                                    >
                                        {
                                            // eslint-disable-next-line security/detect-object-injection
                                            {
                                                ENGLISH: "English",
                                                POLISH: "Polski",
                                            }[key]
                                        }
                                    </MenubarCheckboxItem>
                                );
                            })}
                        </MenubarSubContent>
                    </MenubarSub>

                    <MenubarSub>
                        <MenubarSubTrigger>{t("Theme")}</MenubarSubTrigger>
                        <MenubarSubContent>
                            {(
                                Object.keys(THEMES) as (keyof typeof THEMES)[]
                            ).map(key => {
                                // eslint-disable-next-line security/detect-object-injection
                                const value = THEMES[key];
                                return (
                                    <MenubarCheckboxItem
                                        key={key}
                                        checked={resolvedTheme === value}
                                        onCheckedChange={() => {
                                            setTheme(value);
                                        }}
                                    >
                                        {t(`Theme.Keys.${value}`, {
                                            ns: "object",
                                        })}
                                    </MenubarCheckboxItem>
                                );
                            })}
                        </MenubarSubContent>
                    </MenubarSub>
                </MenubarContent>
            </MenubarPortal>
        </MenubarMenu>
    );
}
