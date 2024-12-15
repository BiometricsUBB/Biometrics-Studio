/* eslint-disable no-param-reassign */
/* eslint-disable sonarjs/prefer-single-boolean-return */
import { Graphics } from "@pixi/react";
import { Graphics as PixiGraphics, Application, ICanvas } from "pixi.js";
import { memo, useCallback } from "react";
import { MarkingsStore } from "@/lib/stores/Markings";
import { MarkingBase } from "@/lib/markings/MarkingBase";
import { ShallowViewportStore } from "@/lib/stores/ShallowViewport";
import { CanvasToolbarStore } from "@/lib/stores/CanvasToolbar";
import { Viewport } from "pixi-viewport";
import { useGlobalViewport } from "../../viewport/hooks/useGlobalViewport";
import { CANVAS_ID } from "../../canvas/hooks/useCanvasContext";
import { useGlobalApp } from "../../app/hooks/useGlobalApp";
import { drawMarking } from "./marking.utils";

export type MarkingsProps = {
    markings: MarkingBase[];
    canvasId: CANVAS_ID;
};
export const Markings = memo(({ canvasId, markings }: MarkingsProps) => {
    const viewport = useGlobalViewport(canvasId) as Viewport;
    const app = useGlobalApp(canvasId) as Application<ICanvas>;

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

    const drawMarkings = useCallback(
        (g: PixiGraphics) => {
            // wyrenderuj wszystkie markingi jako jedna grafika dla lepszej wydajności
            g.clear();
            g.removeChildren();
            markings
                .filter(x =>
                    x.isVisible(
                        app.screen,
                        viewport,
                        viewportWidthRatio,
                        viewportHeightRatio
                    )
                )
                .forEach(marking => {
                    drawMarking(
                        g,
                        selectedMarkingLabel === marking.label,
                        marking,
                        viewportWidthRatio,
                        viewportHeightRatio,
                        showMarkingLabels
                    );
                });
        },
        [
            markings,
            selectedMarkingLabel,
            showMarkingLabels,
            app.screen,
            viewport,
            viewportHeightRatio,
            viewportWidthRatio,
        ]
    );

    return <Graphics draw={drawMarkings} />;
});
