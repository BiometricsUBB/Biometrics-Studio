import React, { useState, Suspense, lazy, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings } from "@/components/tabs/settings/settings";
import { GlobalToolbar } from "@/components/toolbar/toolbar";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils/shadcn";
import SelectMode from "@/views/selectMode";
import { useWorkingMode } from "@/providers/WorkingModeProvider";

const Homepage = lazy(() =>
    import("@/components/tabs/homepage/homepage").then(module => ({
        default: module.Homepage,
    }))
);

const enum TABS {
    HOMEPAGE = "homepage",
    SETTINGS = "settings",
    SELECT_MODE = "select_mode",
}

export default function App() {
    const { t } = useTranslation();
    const [currentTab, setCurrentTab] = useState<TABS>(TABS.HOMEPAGE);
    const { workingMode, setWorkingMode } = useWorkingMode();

    useEffect(() => {
        setCurrentTab(workingMode === "" ? TABS.SELECT_MODE : TABS.HOMEPAGE);
    }, [workingMode]);

    return (
        <main
            data-testid="page-container"
            className="flex w-full min-h-dvh h-full flex-col items-center justify-between"
        >
            <Tabs
                value={currentTab}
                onValueChange={tab => setCurrentTab(tab as TABS)}
                defaultValue={
                    workingMode === "" ? TABS.SELECT_MODE : TABS.HOMEPAGE
                }
                className="w-full flex flex-col items-center flex-grow"
            >
                <TabsList className="w-fit">
                    <TabsTrigger value={TABS.SELECT_MODE}>
                        {t("Working mode")}
                    </TabsTrigger>
                    {workingMode !== "" && (
                        <>
                            <TabsTrigger value={TABS.HOMEPAGE}>
                                {t("Homepage")}
                            </TabsTrigger>
                            <TabsTrigger value={TABS.SETTINGS}>
                                {t("Settings")}
                            </TabsTrigger>
                        </>
                    )}
                </TabsList>

                <TabsContent
                    forceMount
                    value={TABS.SELECT_MODE}
                    className={cn("w-full h-full relative flex flex-grow", {
                        hidden: currentTab !== TABS.SELECT_MODE,
                    })}
                >
                    <SelectMode
                        setCurrentWorkingMode={type => {
                            setWorkingMode(type);
                            setCurrentTab(TABS.HOMEPAGE);
                        }}
                    />
                </TabsContent>

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
                    <Suspense fallback={<div>Loading...</div>}>
                        <Homepage />
                    </Suspense>
                </TabsContent>

                <TabsContent
                    forceMount
                    value={TABS.SETTINGS}
                    className={cn("w-full h-full", {
                        hidden: currentTab !== TABS.SETTINGS,
                    })}
                >
                    <Settings />
                </TabsContent>
            </Tabs>
        </main>
    );
}
