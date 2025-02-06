/* eslint-disable no-param-reassign */
/* eslint-disable sonarjs/prefer-single-boolean-return */
import { Graphics } from "@pixi/react";
import { Graphics as PixiGraphics, Application, ICanvas } from "pixi.js";
import { memo, useCallback } from "react";
import { MarkingsStore } from "@/lib/stores/Markings";
import { MarkingBase } from "@/lib/markings/MarkingBase";
import { CanvasToolbarStore } from "@/lib/stores/CanvasToolbar";
import { Viewport } from "pixi-viewport";
import { MarkingCharacteristicsStore } from "@/lib/stores/MarkingCharacteristics/MarkingCharacteristics";
import { useGlobalViewport } from "../../viewport/hooks/useGlobalViewport";
import { CANVAS_ID } from "../../canvas/hooks/useCanvasContext";
import { useGlobalApp } from "../../app/hooks/useGlobalApp";
import { drawMarking } from "./marking.utils";

export type MarkingsProps = {
    markings: MarkingBase[];
    canvasId: CANVAS_ID;
    alpha?: number;
};
export const Markings = memo(({ canvasId, markings, alpha }: MarkingsProps) => {
    const viewport = useGlobalViewport(canvasId) as Viewport;
    const app = useGlobalApp(canvasId) as Application<ICanvas>;

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
            // wyrenderuj wszystkie markingi jako jedna grafika dla lepszej wydajności
            g.clear();
            g.removeChildren();
            markings
                .filter(x =>
                    x.isVisible(
                        app.screen,
                        { x: viewport.x, y: viewport.y },
                        viewport.scale.x,
                        viewport.scale.y
                    )
                )
                .forEach(marking => {
                    drawMarking(
                        g,
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
            g.alpha = alpha ?? showMarkingLabels ? 1 : 0.5;
        },
        [
            alpha,
            app.screen,
            viewport.x,
            viewport.y,
            viewport.scale.y,
            viewport.scale.x,
            markings,
            selectedMarkingLabel,
            showMarkingLabels,
            markingCharacteristics,
        ]
    );

    return <Graphics draw={drawMarkings} />;
});
