/* eslint-disable no-param-reassign */
/* eslint-disable sonarjs/prefer-single-boolean-return */
import { BitmapText, Graphics } from "@pixi/react";
import { ColorSource, Graphics as PixiGraphics } from "pixi.js";
import { memo, useCallback, useEffect, useState } from "react";
import { MarkingsStore } from "@/lib/stores/Markings";
import { isMarkingBase } from "@/components/information-tabs/markings-info/columns";
import {
    MARKING_TYPE,
    MarkingBase,
    Position,
} from "@/lib/markings/MarkingBase";
import { PointMarking } from "@/lib/markings/PointMarking";
import { RayMarking } from "@/lib/markings/RayMarking";
import { useGlobalViewport } from "../../viewport/hooks/useGlobalViewport";
import { CanvasMetadata } from "../../canvas/hooks/useCanvasContext";
import { useGlobalApp } from "../../app/hooks/useGlobalApp";
import { drawPointMarking, drawRayMarking, isVisible } from "./marking.utils";

const getFontName = (fontSize: number) => {
    const ceiledFontSize = Math.ceil(fontSize);
    const FONT_FAMILY_NAME = "Cousine";
    const MAX_FONT_SIZE = 32;
    const MIN_FONT_SIZE = 6;
    if (ceiledFontSize < MIN_FONT_SIZE)
        return `${FONT_FAMILY_NAME} ${MIN_FONT_SIZE}`;

    if (ceiledFontSize >= MIN_FONT_SIZE && ceiledFontSize <= MAX_FONT_SIZE)
        return `${FONT_FAMILY_NAME} ${ceiledFontSize}`;

    return `${FONT_FAMILY_NAME} 64`;
};

function MarkingText({
    visible,
    label,
    size,
    position,
    textColor,
}: {
    visible: boolean;
    label: number;
    size: number;
    position: Position;
    textColor: ColorSource;
}) {
    const text = label === -1 ? "" : String(label);
    const fontSize = Math.ceil(
        +(
            (size * 2) /
            (String(text).length === 1 ? 1 : String(text).length * 0.58)
        ).toFixed(0)
    );
    const fontName = getFontName(fontSize);

    return (
        <BitmapText
            fontSize={fontSize}
            fontName={fontName}
            visible={visible}
            text={text}
            tint={textColor}
            x={position.x}
            y={position.y}
            anchor={[0.5, 0.43]}
            style={{
                fontName,
                fontSize,
                tint: textColor,
            }}
        />
    );
}

export type MarkingsProps = {
    markings: MarkingBase[];
    canvasMetadata: CanvasMetadata;
    showMarkingLabels?: boolean;
};
export const Markings = memo(
    ({ canvasMetadata, showMarkingLabels, markings }: MarkingsProps) => {
        const viewport = useGlobalViewport(canvasMetadata.id);
        const app = useGlobalApp(canvasMetadata.id);

        const selectedMarking = MarkingsStore(canvasMetadata.id).use(
            state => state.selectedMarking
        );

        const [renderableMarkings, setRenderableMarkings] = useState<
            MarkingBase[]
        >([]);

        const updateRenderableMarkings = useCallback(() => {
            setRenderableMarkings(
                markings.map(marking => ({
                    ...marking,
                    visible: isVisible(marking, markings.length, app, viewport),
                }))
            );
        }, [app, markings, viewport]);

        useEffect(() => {
            viewport?.addEventListener("moved-end", updateRenderableMarkings);

            return () => {
                viewport?.removeEventListener(
                    "moved-end",
                    updateRenderableMarkings
                );
            };
        }, [updateRenderableMarkings, viewport]);

        useEffect(() => {
            updateRenderableMarkings();
        }, [markings, viewport, app, updateRenderableMarkings]);

        const lineWidth = 2;
        const lineLength = 4;
        const shadowWidth = 0.5;

        const drawMarkings = useCallback(
            (g: PixiGraphics) => {
                // wyrenderuj wszystkie markingi jako jedna grafika dla lepszej wydajności
                g.clear();
                g.removeChildren();
                renderableMarkings.forEach(marking => {
                    const selected =
                        selectedMarking && isMarkingBase(selectedMarking)
                            ? selectedMarking.id === marking.id
                            : false;
                    switch (marking.type) {
                        case MARKING_TYPE.POINT:
                            drawPointMarking(
                                g,
                                selected,
                                marking as PointMarking,
                                showMarkingLabels,
                                lineWidth,
                                shadowWidth
                            );
                            break;
                        case MARKING_TYPE.RAY:
                            drawRayMarking(
                                g,
                                selected,
                                marking as RayMarking,
                                showMarkingLabels,
                                lineWidth,
                                shadowWidth,
                                lineLength
                            );
                            break;

                        default:
                            marking.type satisfies never;
                            throw new Error(
                                `Unknown marking type: ${marking.type}`
                            );
                    }
                });
            },
            [renderableMarkings, selectedMarking, showMarkingLabels]
        );

        return (
            <>
                <Graphics draw={drawMarkings} />
                {showMarkingLabels &&
                    renderableMarkings.map(
                        ({
                            visible,
                            hidden,
                            id,
                            label,
                            size,
                            origin,
                            textColor,
                        }) => {
                            return (
                                <MarkingText
                                    visible={visible && !hidden}
                                    key={id}
                                    label={label}
                                    size={size}
                                    position={origin}
                                    textColor={textColor}
                                />
                            );
                        }
                    )}
            </>
        );
    }
);
