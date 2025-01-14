import { Menubar } from "@/components/ui/menubar";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useCallback, useEffect, useState } from "react";
import { Toggle } from "@/components/ui/toggle";
import { Minus, Maximize, Minimize, X } from "lucide-react";
import { SettingsMenu } from "@/components/menu/settings-menu";
import { cn } from "@/lib/utils/shadcn";
import { ICON } from "@/lib/utils/const";
import { ModeMenu } from "@/components/menu/mode-menu";

export function Menu() {
    const [isMaximized, setIsMaximized] = useState(false);

    useEffect(() => {
        const updateMaximized = async () => {
            setIsMaximized(await getCurrentWindow().isMaximized());
        };

        const unlisten = getCurrentWindow().listen(
            "tauri://resize",
            updateMaximized
        );

        return () => {
            unlisten.then(fn => fn());
        };
    }, []);

    const minimizeWindow = useCallback(async () => {
        await getCurrentWindow()?.minimize();
    }, []);

    const maximizeWindow = useCallback(async () => {
        await getCurrentWindow().toggleMaximize();
    }, []);

    const closeWindow = useCallback(async () => {
        await getCurrentWindow().close();
    }, []);

    return (
        <Menubar
            className={cn("flex justify-between w-screen")}
            data-tauri-drag-region
        >
            <div id="leftMenu" className="flex grow-1">
                <div className="flex items-center px-2">
                    <img
                        src="/public/logo.svg"
                        alt="Logo"
                        height={ICON.SIZE}
                        width={ICON.SIZE}
                    />
                </div>
                <ModeMenu />
                <SettingsMenu />
            </div>
            <div id="windowControls" className="flex">
                <Toggle
                    pressed={false}
                    onMouseDown={e => e.stopPropagation()}
                    onDoubleClick={e => e.stopPropagation()}
                    onClickCapture={minimizeWindow}
                >
                    <Minus
                        size={ICON.SIZE / 1.5}
                        strokeWidth={ICON.STROKE_WIDTH}
                    />
                </Toggle>
                <Toggle
                    pressed={false}
                    onMouseDown={e => e.stopPropagation()}
                    onDoubleClick={e => e.stopPropagation()}
                    onClickCapture={maximizeWindow}
                >
                    {isMaximized ? (
                        <Minimize
                            size={ICON.SIZE / 1.5}
                            strokeWidth={ICON.STROKE_WIDTH}
                        />
                    ) : (
                        <Maximize
                            size={ICON.SIZE / 1.5}
                            strokeWidth={ICON.STROKE_WIDTH}
                        />
                    )}
                </Toggle>
                <Toggle
                    pressed={false}
                    onMouseDown={e => e.stopPropagation()}
                    onDoubleClick={e => e.stopPropagation()}
                    onClickCapture={closeWindow}
                    className="hover:bg-destructive hover:text-destructive-foreground"
                >
                    <X size={ICON.SIZE / 1.5} strokeWidth={ICON.STROKE_WIDTH} />
                </Toggle>
            </div>
        </Menubar>
    );
}
