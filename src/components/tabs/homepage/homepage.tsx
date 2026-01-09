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
import { useMemo, useEffect } from "react";
import { useKeyboardShortcuts } from "@/lib/hooks/useKeyboardShortcuts";
import { VerticalToolbar } from "@/components/toolbar/vertical-toolbar";
import { listen } from "@tauri-apps/api/event";
import { getCanvas } from "@/components/pixi/canvas/hooks/useCanvas";
import { loadImage } from "@/lib/utils/viewport/loadImage";
import { saveMarkingsDataToPath } from "@/lib/utils/viewport/saveMarkingsDataWithDialog";
import { Sprite } from "pixi.js";
import { Viewport } from "pixi-viewport";

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

    // Helper function to check if error is forbidden/permission error
    const isForbiddenError = (error: unknown): boolean => {
        const errorMessage =
            error instanceof Error ? error.message : String(error);
        return (
            errorMessage.toLowerCase().includes("forbidden") ||
            errorMessage.toLowerCase().includes("not allowed") ||
            errorMessage.toLowerCase().includes("permission")
        );
    };

    // Helper function to handle viewport reload
    const handleViewportReload = async (
        viewport: Viewport,
        originalPath: string,
        newPath: string
    ): Promise<boolean> => {
        const sprite = viewport.children.find(x => x instanceof Sprite) as
            | Sprite
            | undefined;

        // @ts-expect-error custom property should exist
        if (!sprite || sprite.path !== originalPath) {
            return false;
        }

        // Save annotations before reloading to preserve them
        try {
            const markingsFilePath = `${originalPath}.json`;
            await saveMarkingsDataToPath(viewport, markingsFilePath);
        } catch {
            // Continue with reload even if saving annotations fails
        }

        try {
            await loadImage(newPath, viewport);
            return true;
        } catch (error) {
            if (isForbiddenError(error)) {
                // Don't replace the old image if permission error
                const { showErrorDialog } = await import(
                    "@/lib/errors/showErrorDialog"
                );
                showErrorDialog(
                    "The edited image was saved, but cannot be loaded due to path restrictions. Please try loading it manually."
                );
                return true; // Indicate we handled it (even though we didn't reload)
            }
            throw error;
        }
    };

    // Listen for image reload requests from the edit window
    useEffect(() => {
        const setupListener = async () => {
            return listen<{ originalPath: string; newPath: string } | string>(
                "image-reload-requested",
                async event => {
                    // Handle both old format (string) and new format (object with originalPath and newPath)
                    const originalPath =
                        typeof event.payload === "string"
                            ? event.payload
                            : event.payload.originalPath;
                    const newPath =
                        typeof event.payload === "string"
                            ? event.payload
                            : event.payload.newPath;

                    const leftCanvas = getCanvas(CANVAS_ID.LEFT, true);
                    const rightCanvas = getCanvas(CANVAS_ID.RIGHT, true);

                    // Try left viewport first
                    if (leftCanvas.viewport) {
                        const handled = await handleViewportReload(
                            leftCanvas.viewport,
                            originalPath,
                            newPath
                        );
                        if (handled) return;
                    }

                    // Try right viewport
                    if (rightCanvas.viewport) {
                        await handleViewportReload(
                            rightCanvas.viewport,
                            originalPath,
                            newPath
                        );
                    }
                }
            );
        };

        let unlistenPromise: Promise<() => void> | null = null;
        setupListener().then(unlisten => {
            unlistenPromise = Promise.resolve(unlisten);
        });

        return () => {
            if (unlistenPromise) {
                unlistenPromise.then(fn => fn());
            }
        };
    }, []);

    return (
        <ResizablePanelGroup
            direction="horizontal"
            className="flex-grow overflow-hidden max-h-screen bg-[hsl(var(--background))]/40 gap-4 p-4"
        >
            <ResizablePanel defaultSize={80} minSize={50}>
                <div className="h-full w-full bg-card backdrop-blur-3xl rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] border border-border/40 p-4">
                    <ResizablePanelGroup
                        direction="horizontal"
                        className="h-full gap-4"
                    >
                        <ResizablePanel defaultSize={50} minSize={20}>
                            <ResizablePanelGroup
                                direction="vertical"
                                className="overflow-hidden gap-3"
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
                                            <div className="flex-1 flex items-center justify-center">
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
                                className="overflow-hidden gap-3"
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
                                            <div className="flex-1 flex items-center justify-center">
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
