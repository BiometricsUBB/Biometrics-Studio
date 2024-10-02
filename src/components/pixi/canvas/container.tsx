import { HTMLAttributes, useCallback, useState } from "react";
import { cn } from "@/lib/utils/shadcn";
import { Toggle } from "@/components/ui/toggle";
import { ImageUp } from "lucide-react";
import { ICON } from "@/lib/utils/const";
import { loadImageWithDialog } from "@/lib/utils/viewport/loadImageWithDialog";
import { loadImageFromFile } from "@/lib/utils/viewport/loadImageFromFile";
import { useTranslation } from "react-i18next";
import { CanvasToolbarStore } from "@/lib/stores/CanvasToolbar";
import { useCanvasContext } from "./hooks/useCanvasContext";
import { CanvasToolbar } from "./canvas-toolbar";
import { Canvas } from "./canvas";
import { useGlobalViewport } from "../viewport/hooks/useGlobalViewport";
import { CanvasInfo } from "./canvas-info";

export type CanvasContainerProps = HTMLAttributes<HTMLDivElement>;
export function CanvasContainer({ ...props }: CanvasContainerProps) {
    const { t } = useTranslation();
    const { id } = useCanvasContext();
    const viewport = useGlobalViewport(id, { autoUpdate: true });

    const [divSize, setDivSize] = useState({ width: 0, height: 0 });

    const divRef = useCallback((node: HTMLDivElement | null) => {
        if (!node) return;
        const resizeObserver = new ResizeObserver(() => {
            setDivSize({
                width: node.clientWidth,
                height: node.clientHeight,
            });
        });
        resizeObserver.observe(node);
    }, []);

    const isViewportHidden =
        viewport === null || viewport.children.length === 0;

    const showCanvasInformation = CanvasToolbarStore(id).use(
        state => state.settings.viewport.showInformation
    );

    return (
        <div
            className="w-full h-full relative flex items-center justify-center"
            ref={divRef}
            {...props}
            onDrop={event =>
                loadImageFromFile(viewport!, event.dataTransfer.files[0])
            }
        >
            {isViewportHidden && viewport !== null && (
                <Toggle
                    size="default"
                    className="size-3/4 flex flex-col overflow-hidden"
                    variant="outline"
                    pressed={false}
                    onClick={() => {
                        loadImageWithDialog(viewport);
                    }}
                >
                    <ImageUp size={64} strokeWidth={ICON.STROKE_WIDTH} />
                    <div>
                        {t("Load forensic mark image", { ns: "tooltip" })}
                    </div>
                </Toggle>
            )}
            <div className={cn("size-full", { hidden: isViewportHidden })}>
                {showCanvasInformation && <CanvasInfo />}
                <CanvasToolbar />
                <Canvas
                    aria-label="canvas"
                    width={divSize.width}
                    height={divSize.height}
                />
            </div>
        </div>
    );
}
