import { InformationTabs } from "@/components/information-tabs/information-tabs";
import { CanvasContainer } from "@/components/pixi/canvas/container";
import { CanvasHeader } from "@/components/pixi/canvas/canvas-header";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
    CANVAS_ID,
    CanvasContext,
    CanvasMetadata,
} from "@/components/pixi/canvas/hooks/useCanvasContext";
import { useMemo } from "react";
import { useKeyboardShortcuts } from "@/lib/hooks/useKeyboardShortcuts";
import { VerticalToolbar } from "@/components/toolbar/vertical-toolbar";

export function Homepage() {
    useKeyboardShortcuts();

    const leftCanvasMetadata: CanvasMetadata = useMemo(
        () => ({
            id: CANVAS_ID.LEFT,
        }),
        []
    );

    const rightCanvasMetadata: CanvasMetadata = useMemo(
        () => ({
            id: CANVAS_ID.RIGHT,
        }),
        []
    );

    return (
        <ResizablePanelGroup
            direction="horizontal"
            className="flex-grow max-h-screen bg-[hsl(var(--background))]/40 gap-2 p-2 pb-2 overflow-visible"
        >
            <ResizablePanel defaultSize={80} minSize={50}>
                <div className="h-full w-full bg-card backdrop-blur-3xl rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] border border-border/40 p-2">
                    <ResizablePanelGroup
                        direction="horizontal"
                        className="h-full gap-2"
                    >
                        <ResizablePanel defaultSize={50} minSize={20}>
                            <ResizablePanelGroup
                                direction="vertical"
                                className="overflow-hidden gap-1.5"
                            >
                                <CanvasContext.Provider
                                    value={leftCanvasMetadata}
                                >
                                    <ResizablePanel
                                        defaultSize={75}
                                        minSize={2}
                                    >
                                        <div className="flex flex-col h-full w-full bg-background rounded-lg overflow-hidden">
                                            <CanvasHeader />
                                            <div className="flex-1 min-h-0 flex items-center justify-center overflow-hidden">
                                                <CanvasContainer />
                                            </div>
                                        </div>
                                    </ResizablePanel>
                                    <ResizableHandle className="bg-border/40" />
                                    <ResizablePanel
                                        defaultSize={25}
                                        minSize={2}
                                    >
                                        <div className="flex h-full w-full bg-muted/30 rounded-lg border border-border/30">
                                            <InformationTabs />
                                        </div>
                                    </ResizablePanel>
                                </CanvasContext.Provider>
                            </ResizablePanelGroup>
                        </ResizablePanel>

                        <ResizableHandle className="bg-border/40" />

                        <ResizablePanel defaultSize={50} minSize={20}>
                            <ResizablePanelGroup
                                direction="vertical"
                                className="overflow-hidden gap-1.5"
                            >
                                <CanvasContext.Provider
                                    value={rightCanvasMetadata}
                                >
                                    <ResizablePanel
                                        defaultSize={75}
                                        minSize={2}
                                    >
                                        <div className="flex flex-col h-full w-full bg-background rounded-lg overflow-hidden">
                                            <CanvasHeader />
                                            <div className="flex-1 min-h-0 flex items-center justify-center overflow-hidden">
                                                <CanvasContainer />
                                            </div>
                                        </div>
                                    </ResizablePanel>
                                    <ResizableHandle className="bg-border/40" />
                                    <ResizablePanel
                                        defaultSize={25}
                                        minSize={2}
                                    >
                                        <div className="flex h-full w-full bg-muted/30 rounded-lg border border-border/30">
                                            <InformationTabs />
                                        </div>
                                    </ResizablePanel>
                                </CanvasContext.Provider>
                            </ResizablePanelGroup>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </div>
            </ResizablePanel>

            <ResizableHandle className="bg-transparent" />

            <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
                <div className="flex flex-col h-full w-full rounded-2xl overflow-hidden brightness-150">
                    <VerticalToolbar className="min-h-0" />
                </div>
            </ResizablePanel>
        </ResizablePanelGroup>
    );
}
