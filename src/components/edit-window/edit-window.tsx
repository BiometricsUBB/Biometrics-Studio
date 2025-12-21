import React, { useState, useEffect } from "react";
import { WindowControls } from "@/components/menu/window-controls";
import { Menubar } from "@/components/ui/menubar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/shadcn";
import { ICON } from "@/lib/utils/const";
import { Edit } from "lucide-react";
import { listen } from "@tauri-apps/api/event";
import { readFile } from "@tauri-apps/plugin-fs";

export function EditWindow() {
    const [imagePath, setImagePath] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [brightness, setBrightness] = useState<number>(100);
    const [contrast, setContrast] = useState<number>(100);

    const loadImage = async (path: string) => {
        try {
            setError(null);
            setImageUrl(null);
            const imageBytes = await readFile(path);
            const blob = new Blob([imageBytes]);
            const url = URL.createObjectURL(blob);
            setImageUrl(url);
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Failed to load image";
            setError(`${errorMessage} (Path: ${path})`);
            setImageUrl(null);
        }
    };

    useEffect(() => {
        // Check URL parameters for initial image path
        const urlParams = new URLSearchParams(window.location.search);
        const pathFromUrl = urlParams.get("imagePath");

        if (pathFromUrl) {
            // Decode the path from URL and convert forward slashes back to backslashes on Windows
            const decodedPath = decodeURIComponent(pathFromUrl);
            // On Windows, convert forward slashes back to backslashes for file paths
            const normalizedPath = decodedPath.replace(/\//g, "\\");
            setImagePath(normalizedPath);
            loadImage(normalizedPath);
        }

        // Listen for image path changes from the main window (when window already exists)
        const setupListener = async () => {
            return listen<string>("image-path-changed", event => {
                setImagePath(event.payload);
                loadImage(event.payload);
            });
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

    // Cleanup object URL on unmount
    useEffect(() => {
        return () => {
            if (imageUrl) {
                URL.revokeObjectURL(imageUrl);
            }
        };
    }, [imageUrl]);

    return (
        <main
            data-testid="edit-window"
            className="flex w-full min-h-dvh h-full flex-col items-center justify-between bg-[hsl(var(--background))] relative overflow-hidden"
        >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[75%] h-[85%] brightness-150 rounded-2xl bg-primary/20 blur-[150px]" />
            </div>

            <Menubar
                className={cn(
                    "flex justify-between w-screen items-center min-h-[56px]"
                )}
                data-tauri-drag-region
            >
                <div className="flex grow-1 items-center">
                    <div className="flex items-center px-2">
                        <Edit
                            size={ICON.SIZE}
                            strokeWidth={ICON.STROKE_WIDTH}
                            className="text-foreground"
                        />
                    </div>
                    <span className="text-sm font-medium text-foreground">
                        Edit Image
                    </span>
                </div>
                <WindowControls />
            </Menubar>

            <div className="flex flex-1 w-full overflow-hidden p-4 flex-col">
                {error ? (
                    <div className="text-center flex-1 flex items-center justify-center">
                        <div>
                            <p className="text-destructive text-lg font-medium mb-2">
                                Error loading image
                            </p>
                            <p className="text-muted-foreground text-sm">
                                {error}
                            </p>
                        </div>
                    </div>
                ) : imageUrl ? (
                    <>
                        <div className="flex-1 w-full flex items-center justify-center overflow-hidden mb-4">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={imageUrl}
                                alt={imagePath || "Loaded image"}
                                className="max-w-full max-h-full object-contain"
                                style={{
                                    filter: `brightness(${brightness / 100}) contrast(${contrast / 100})`,
                                }}
                            />
                        </div>
                        <div className="w-full bg-background/70 backdrop-blur-sm border border-border/30 rounded-lg p-4 space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label
                                        htmlFor="brightness"
                                        className="text-sm font-medium"
                                    >
                                        Brightness
                                    </Label>
                                    <span className="text-sm text-muted-foreground">
                                        {brightness}%
                                    </span>
                                </div>
                                <Input
                                    id="brightness"
                                    type="range"
                                    min="0"
                                    max="200"
                                    value={brightness}
                                    onChange={e =>
                                        setBrightness(Number(e.target.value))
                                    }
                                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label
                                        htmlFor="contrast"
                                        className="text-sm font-medium"
                                    >
                                        Contrast
                                    </Label>
                                    <span className="text-sm text-muted-foreground">
                                        {contrast}%
                                    </span>
                                </div>
                                <Input
                                    id="contrast"
                                    type="range"
                                    min="0"
                                    max="200"
                                    value={contrast}
                                    onChange={e =>
                                        setContrast(Number(e.target.value))
                                    }
                                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center flex-1 flex items-center justify-center">
                        <div>
                            <p className="text-muted-foreground text-lg font-medium">
                                No image
                            </p>
                            <p className="text-muted-foreground/70 text-sm mt-2">
                                Load an image in the main window to edit it
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
