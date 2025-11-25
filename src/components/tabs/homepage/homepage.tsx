import { InformationTabs } from "@/components/information-tabs/information-tabs";
import { CanvasContainer } from "@/components/pixi/canvas/container";
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
            className="flex-grow rounded-lg border overflow-hidden max-h-screen"
        >
            <ResizablePanel defaultSize={40} minSize={10}>
                <ResizablePanelGroup
                    direction="vertical"
                    className="rounded-lg border overflow-hidden"
                >
                    <CanvasContext.Provider value={leftCanvasMetadata}>
                        <ResizablePanel defaultSize={75} minSize={2}>
                            <div className="flex flex-col h-full w-full items-center justify-center">
                                <CanvasContainer />
                            </div>
                        </ResizablePanel>
                        <ResizableHandle />
                        <ResizablePanel defaultSize={25} minSize={2}>
                            <div className="flex h-full w-full">
                                <InformationTabs />
                            </div>
                        </ResizablePanel>
                    </CanvasContext.Provider>
                </ResizablePanelGroup>
            </ResizablePanel>

            <ResizableHandle />

            <ResizablePanel defaultSize={40} minSize={10}>
                <ResizablePanelGroup
                    direction="vertical"
                    className="rounded-lg border overflow-hidden"
                >
                    <CanvasContext.Provider value={rightCanvasMetadata}>
                        <ResizablePanel defaultSize={75} minSize={2}>
                            <div className="flex flex-col h-full w-full items-center justify-center">
                                <CanvasContainer />
                            </div>
                        </ResizablePanel>
                        <ResizableHandle />
                        <ResizablePanel defaultSize={25} minSize={2}>
                            <div className="flex h-full w-full">
                                <InformationTabs />
                            </div>
                        </ResizablePanel>
                    </CanvasContext.Provider>
                </ResizablePanelGroup>
            </ResizablePanel>

            <ResizableHandle />

            <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
                <div className="flex flex-col h-full w-full border rounded-lg bg-background overflow-hidden">
                    <VerticalToolbar className="min-h-0" />
                </div>
            </ResizablePanel>
        </ResizablePanelGroup>
    );
}
