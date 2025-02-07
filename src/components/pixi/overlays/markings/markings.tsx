import { Graphics } from "@pixi/react";
import { Graphics as PixiGraphics } from "pixi.js";
import { memo, useCallback } from "react";
import { MarkingsStore } from "@/lib/stores/Markings";
import { MarkingBase } from "@/lib/markings/MarkingBase";
import { CanvasToolbarStore } from "@/lib/stores/CanvasToolbar";
import { MarkingCharacteristicsStore } from "@/lib/stores/MarkingCharacteristics/MarkingCharacteristics";
import { Viewport } from "pixi-viewport";
import { useGlobalViewport } from "@/components/pixi/viewport/hooks/useGlobalViewport";
import { CANVAS_ID } from "../../canvas/hooks/useCanvasContext";
import { drawMarking } from "./marking.utils";

export type MarkingsProps = {
    markings: MarkingBase[];
    canvasId: CANVAS_ID;
    alpha?: number;
};

export const Markings = memo(({ canvasId, markings, alpha }: MarkingsProps) => {
    const viewport = useGlobalViewport(canvasId) as Viewport;
    const showMarkingLabels = CanvasToolbarStore(canvasId).use(
        state => state.settings.markings.showLabels
    );

    const selectedMarkingLabel = MarkingsStore(canvasId).use(
        state => state.selectedMarkingLabel
    );

    const markingCharacteristics = MarkingCharacteristicsStore.use(
        state => state.characteristics
    );

    const drawMarkings = useCallback(
        (g: PixiGraphics) => {
            g.children
                .find(x => x.name === "markingsContainer")
                ?.destroy({
                    children: true,
                    texture: true,
                    baseTexture: true,
                });

            const markingsContainer = new PixiGraphics();
            markingsContainer.name = "markingsContainer";
            g.addChild(markingsContainer);
            markings.forEach(marking => {
                drawMarking(
                    markingsContainer as PixiGraphics,
                    selectedMarkingLabel === marking.label,
                    marking,
                    markingCharacteristics.find(
                        x => x.id === marking.characteristicId
                    )!,
                    viewport.scale.x,
                    viewport.scale.y,
                    showMarkingLabels
                );
            });

            // Set the alpha to provided value or based on showMarkingLabels config
            // eslint-disable-next-line no-param-reassign
            g.alpha = alpha ?? showMarkingLabels ? 1 : 0.5;
        },
        [
            alpha,
            viewport.scale.x,
            viewport.scale.y,
            markings,
            selectedMarkingLabel,
            showMarkingLabels,
            markingCharacteristics,
        ]
    );

    return <Graphics draw={drawMarkings} />;
});
