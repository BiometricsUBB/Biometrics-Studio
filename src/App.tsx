import React, { useState, Suspense, lazy, useEffect } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { GlobalToolbar } from "@/components/toolbar/toolbar";
import { cn } from "@/lib/utils/shadcn";
import SelectMode from "@/views/selectMode";
import { Menu } from "@/components/menu/menu";
import { WorkingModeStore } from "@/lib/stores/WorkingMode";

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
    const [currentTab, setCurrentTab] = useState<TABS>(TABS.HOMEPAGE);
    const { workingMode, setWorkingMode } = WorkingModeStore.use();

    useEffect(() => {
        setCurrentTab(workingMode === "" ? TABS.SELECT_MODE : TABS.HOMEPAGE);
    }, [workingMode]);

    return (
        <main
            data-testid="page-container"
            className="flex w-full min-h-dvh h-full flex-col items-center justify-between"
        >
            <Menu />
            <Tabs
                value={currentTab}
                onValueChange={tab => setCurrentTab(tab as TABS)}
                defaultValue={
                    workingMode === "" ? TABS.SELECT_MODE : TABS.HOMEPAGE
                }
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
                    <GlobalToolbar />
                    <Suspense fallback={<div>Loading...</div>}>
                        <Homepage />
                    </Suspense>
                </TabsContent>
            </Tabs>
        </main>
    );
}
