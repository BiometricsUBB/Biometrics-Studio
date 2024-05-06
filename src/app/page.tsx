"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings } from "@/components/tabs/settings/settings";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/shadcn";
import dynamic from "next/dynamic";
import { GlobalToolbar } from "@/components/toolbar/toolbar";
import { useTranslation } from "react-i18next";
import { CUSTOM_GLOBAL_EVENTS } from "@/lib/utils/const";
import { MarkingsStore } from "@/lib/stores/Markings";
import { CANVAS_ID } from "@/components/pixi/canvas/hooks/useCanvasContext";
import { GlobalStateStore } from "@/lib/stores/GlobalState";

const Homepage = dynamic(
    () =>
        import("@/components/tabs/homepage/homepage").then(mod => mod.Homepage),
    { ssr: false }
);

const enum TABS {
    HOMEPAGE = "homepage",
    SETTINGS = "settings",
}

export default function Home() {
    const { t } = useTranslation();

    const initialTab = TABS.HOMEPAGE;
    const [currentTab, setCurrentTab] = useState<TABS>(initialTab);

    useEffect(() => {
        const performCleanup = () => {
            document.dispatchEvent(
                new Event(CUSTOM_GLOBAL_EVENTS.INTERRUPT_MARKING)
            );
            MarkingsStore(CANVAS_ID.LEFT).actions.labelGenerator.reset();
            MarkingsStore(CANVAS_ID.RIGHT).actions.labelGenerator.reset();
            GlobalStateStore.actions.lastAddedMarking.setLastAddedMarking(null);
        };

        document.addEventListener(CUSTOM_GLOBAL_EVENTS.CLEANUP, performCleanup);

        return () => {
            document.removeEventListener(
                CUSTOM_GLOBAL_EVENTS.CLEANUP,
                performCleanup
            );
        };
    });

    return (
        <main
            data-testid="page-container"
            className="flex w-full min-h-dvh h-full flex-col items-center justify-between"
        >
            <Tabs
                onValueChange={tab => setCurrentTab(tab as TABS)}
                defaultValue={initialTab}
                className="w-full flex flex-col items-center flex-grow"
            >
                <TabsList className="w-fit">
                    <TabsTrigger value={TABS.HOMEPAGE}>
                        {t("Homepage")}
                    </TabsTrigger>
                    <TabsTrigger value={TABS.SETTINGS}>
                        {t("Settings")}
                    </TabsTrigger>
                </TabsList>
                <TabsContent
                    forceMount
                    value={TABS.HOMEPAGE}
                    className={cn(
                        "flex flex-col justify-center items-center flex-grow w-full",
                        {
                            hidden: currentTab !== TABS.HOMEPAGE,
                        }
                    )}
                >
                    <GlobalToolbar />
                    <Homepage />
                </TabsContent>
                <TabsContent value={TABS.SETTINGS} className="w-full h-full">
                    <Settings />
                </TabsContent>
            </Tabs>
        </main>
    );
}
