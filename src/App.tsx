import React, { useState, Suspense, lazy, useEffect } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils/shadcn";
import SelectMode from "@/views/selectMode";
import { Menu } from "@/components/menu/menu";
import { WorkingModeStore } from "@/lib/stores/WorkingMode";
import { useSettingsSync } from "@/lib/hooks/useSettingsSync";
import { useCustomTheme } from "@/lib/hooks/useCustomTheme";
import { CustomThemeStore } from "@/lib/stores/CustomTheme";

const Homepage = lazy(() =>
    import("@/components/tabs/homepage/homepage").then(module => ({
        default: module.Homepage,
    }))
);

const enum TABS {
    HOMEPAGE = "homepage",
    SELECT_MODE = "select_mode",
}

export default function App() {
    const [currentTab, setCurrentTab] = useState<TABS>(TABS.SELECT_MODE);
    const { setWorkingMode } = WorkingModeStore.use();

    useEffect(() => {
        CustomThemeStore.rehydrate();
    }, []);

    useSettingsSync();
    useCustomTheme();

    return (
        <main
            data-testid="page-container"
            className="flex w-full min-h-dvh h-full  flex-col items-center justify-between bg-[hsl(var(--background))] relative overflow-hidden"
        >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {currentTab === TABS.SELECT_MODE ? (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/20 blur-[150px]" />
                ) : (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[75%] h-[85%] brightness-150 rounded-2xl bg-primary/20 blur-[150px]" />
                )}
            </div>
            <Menu />
            <Tabs
                value={currentTab}
                onValueChange={tab => setCurrentTab(tab as TABS)}
                className="w-full flex flex-col items-center flex-grow"
            >
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
                    <Suspense fallback={<div>Loading...</div>}>
                        <Homepage />
                    </Suspense>
                </TabsContent>
            </Tabs>
        </main>
    );
}
