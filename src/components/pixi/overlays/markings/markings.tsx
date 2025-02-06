import { Graphics } from "@pixi/react";
import { Graphics as PixiGraphics } from "pixi.js";
import { memo, useCallback } from "react";
import { MarkingsStore } from "@/lib/stores/Markings";
import { MarkingBase } from "@/lib/markings/MarkingBase";
import { ShallowViewportStore } from "@/lib/stores/ShallowViewport";
import { CanvasToolbarStore } from "@/lib/stores/CanvasToolbar";
import { MarkingCharacteristicsStore } from "@/lib/stores/MarkingCharacteristics/MarkingCharacteristics";
import { CANVAS_ID } from "../../canvas/hooks/useCanvasContext";
import { drawMarking } from "./marking.utils";

export type MarkingsProps = {
    markings: MarkingBase[];
    canvasId: CANVAS_ID;
    alpha?: number;
};

export const Markings = memo(({ canvasId, markings, alpha }: MarkingsProps) => {
    const showMarkingLabels = CanvasToolbarStore(canvasId).use(
        state => state.settings.markings.showLabels
    );

    // oblicz proporcje viewportu do świata tylko na evencie zoomed, dla lepszej wydajności (nie ma sensu liczyć tego na każdym renderze
    // bo przy samym ruchu nie zmieniają się proporcje viewportu do świata, tylko przy zoomie)
    const { viewportWidthRatio, viewportHeightRatio } = ShallowViewportStore(
        canvasId
    ).use(
        ({
            size: {
                screenWorldWidth,
                screenWorldHeight,
                worldWidth,
                worldHeight,
            },
        }) => ({
            viewportWidthRatio: screenWorldWidth / worldWidth,
            viewportHeightRatio: screenWorldHeight / worldHeight,
        })
    );

    const selectedMarkingLabel = MarkingsStore(canvasId).use(
        state => state.selectedMarkingLabel
    );

    const markingCharacteristics = MarkingCharacteristicsStore.use(
        state => state.characteristics
    );

    const drawMarkings = useCallback(
        (g: PixiGraphics) => {
            // wyrenderuj wszystkie markingi jako jedna grafika dla lepszej wydajności
            g.clear();
            g.removeChildren();
            markings.forEach(marking => {
                drawMarking(
                    g,
                    selectedMarkingLabel === marking.label,
                    marking,
                    markingCharacteristics.find(
                        x => x.id === marking.characteristicId
                    )!,
                    viewportWidthRatio,
                    viewportHeightRatio,
                    showMarkingLabels
                );
            });

            // Set the alpha to provided value or based on showMarkingLabels config
            // eslint-disable-next-line no-param-reassign
            g.alpha = alpha ?? showMarkingLabels ? 1 : 0.5;
        },
        [
            alpha,
            viewportHeightRatio,
            viewportWidthRatio,
            markings,
            selectedMarkingLabel,
            showMarkingLabels,
            markingCharacteristics,
        ]
    );

    return <Graphics draw={drawMarkings} />;
});
