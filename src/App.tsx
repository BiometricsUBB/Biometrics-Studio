import React, { useState, Suspense } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { GlobalToolbar } from "@/components/toolbar/toolbar";
import { cn } from "@/lib/utils/shadcn";
import { Menu } from "@/components/menu/menu";

const Homepage = React.lazy(() =>
    import("@/components/tabs/homepage/homepage").then(module => ({
        default: module.Homepage,
    }))
);

const enum TABS {
    HOMEPAGE = "homepage",
}

export default function App() {
    const [currentTab, setCurrentTab] = useState<TABS>(TABS.HOMEPAGE);

    return (
        <main
            data-testid="page-container"
            className="flex w-full min-h-dvh h-full flex-col items-center justify-between"
        >
            <Menu />
            <Tabs
                onValueChange={tab => setCurrentTab(tab as TABS)}
                defaultValue={TABS.HOMEPAGE}
                className="w-full flex flex-col items-center flex-grow"
            >
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
