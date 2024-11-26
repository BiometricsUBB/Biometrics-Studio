import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { useTheme } from "@/lib/hooks/useTheme";
import {
    GlobalSettingsStore,
    LANGUAGES,
    PRERENDER_RADIUS_OPTIONS,
    THEMES,
} from "@/lib/stores/GlobalSettings";
import { useEffect } from "react";
import { ICON } from "@/lib/utils/const";
import { Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SettingsCard } from "./settings-card";
import { SettingsSwitch } from "./settings-swtich";
import { SettingsRadioGroup } from "./settings-radio-group";
import { SettingsCardTitle } from "./settings-card-title";
import { SettingsCardDescription } from "./settings-card-description";

const enum TABS {
    INTERFACE = "interface",
    VIDEO = "video",
}

export function Settings() {
    const { theme: resolvedTheme, setTheme } = useTheme();

    const { i18n, t } = useTranslation();
    const setLanguage = (lng: LANGUAGES) => {
        i18n.changeLanguage(lng);
    };

    const { video } = GlobalSettingsStore.use(state => state.settings);

    const actions = GlobalSettingsStore.actions.settings;
    const { setPrerenderRadius } = actions.video;
    const { setLanguage: setStoreLanguage } = actions.language;
    const { setTheme: setStoreTheme } = actions.interface;

    useEffect(() => {
        setStoreTheme(resolvedTheme as THEMES);
    }, [resolvedTheme, setStoreTheme]);

    useEffect(() => {
        setStoreLanguage(i18n.language as LANGUAGES);
    }, [i18n.language, setStoreLanguage]);

    return (
        <Tabs
            defaultValue={TABS.INTERFACE}
            className="w-full h-full flex flex-col items-center"
        >
            <TabsList className="w-fit">
                <TabsTrigger value={TABS.INTERFACE}>
                    {t("Interface")}
                </TabsTrigger>
                <TabsTrigger value={TABS.VIDEO}>{t("Video")}</TabsTrigger>
            </TabsList>

            <TabsContent
                value={TABS.INTERFACE}
                className="w-full h-full flex justify-center items-center gap-4"
            >
                <SettingsCard className="h-full" title={t("Language")}>
                    <SettingsCardTitle>{t("Language")}</SettingsCardTitle>
                    <SettingsRadioGroup
                        defaultValue={i18n.language as LANGUAGES}
                        onValueChange={value => {
                            setLanguage(value as LANGUAGES);
                        }}
                    >
                        {(
                            Object.keys(LANGUAGES) as (keyof typeof LANGUAGES)[]
                        ).map(key => {
                            // eslint-disable-next-line security/detect-object-injection
                            const value = LANGUAGES[key];
                            return (
                                <RadioGroupItem
                                    key={key}
                                    value={value}
                                    label={
                                        // eslint-disable-next-line security/detect-object-injection
                                        {
                                            ENGLISH: "English",
                                            POLISH: "Polski",
                                        }[key]
                                    }
                                />
                            );
                        })}
                    </SettingsRadioGroup>
                </SettingsCard>

                <SettingsCard className="h-full" title={t("Theme")}>
                    <SettingsCardTitle>{t("Dark mode")}</SettingsCardTitle>
                    <SettingsSwitch
                        icon={
                            resolvedTheme === THEMES.DARK ? (
                                <Moon
                                    size={ICON.SIZE}
                                    strokeWidth={ICON.STROKE_WIDTH}
                                />
                            ) : (
                                <Sun
                                    size={ICON.SIZE}
                                    strokeWidth={ICON.STROKE_WIDTH}
                                />
                            )
                        }
                        checked={resolvedTheme === THEMES.DARK}
                        onCheckedChange={checked => {
                            setTheme(checked ? THEMES.DARK : THEMES.LIGHT);
                        }}
                    />
                </SettingsCard>
            </TabsContent>

            <TabsContent
                value={TABS.VIDEO}
                className="w-full flex justify-center items-start"
            >
                <SettingsCard className="h-full" title={t("Rendering")}>
                    <SettingsCardTitle>
                        {t("PrerenderingRadius.Name", { ns: "object" })}
                    </SettingsCardTitle>
                    <SettingsCardDescription>
                        {t("Prerendering radius", { ns: "description" })}
                    </SettingsCardDescription>
                    <SettingsRadioGroup
                        defaultValue={video.rendering.prerenderRadius}
                        onValueChange={value => {
                            setPrerenderRadius(
                                value as PRERENDER_RADIUS_OPTIONS
                            );
                        }}
                    >
                        {(
                            Object.keys(
                                PRERENDER_RADIUS_OPTIONS
                            ) as (keyof typeof PRERENDER_RADIUS_OPTIONS)[]
                        ).map(key => {
                            // eslint-disable-next-line security/detect-object-injection
                            const value = PRERENDER_RADIUS_OPTIONS[key];
                            return (
                                <RadioGroupItem
                                    key={key}
                                    value={value}
                                    label={t(
                                        `PrerenderingRadius.Keys.${value}`,
                                        {
                                            ns: "object",
                                        }
                                    )}
                                />
                            );
                        })}
                    </SettingsRadioGroup>
                </SettingsCard>
            </TabsContent>
        </Tabs>
    );
}
