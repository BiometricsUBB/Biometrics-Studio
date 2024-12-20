import { Graphics } from "@pixi/react";
import { ColorSource, Graphics as PixiGraphics } from "pixi.js";
import { useCallback } from "react";

function drawGrid(
    g: PixiGraphics,
    color: ColorSource,
    gridCount: number,
    width: number,
    height: number,
    lineWidth: number
) {
    g.lineStyle(lineWidth, color)
        .drawRect(0, 0, width, height)
        .lineStyle(lineWidth, color);
    for (let i = 1; i < gridCount; i += 1) {
        g.moveTo((i * width) / gridCount, 0)
            .lineTo((i * width) / gridCount, height)
            .moveTo(0, (i * height) / gridCount)
            .lineTo(width, (i * height) / gridCount);
    }
}

export type GridProps = {
    width: number;
    height: number;
    color: string;
    gridLinesCount: number;
    gridLinesWidth?: number;
};
export function Grid({
    color,
    width,
    height,
    gridLinesCount,
    gridLinesWidth = 2,
}: GridProps) {
    const draw = useCallback(
        (g: PixiGraphics) => {
            g.clear();
            drawGrid(g, color, gridLinesCount, width, height, gridLinesWidth);
        },
        [color, gridLinesCount, gridLinesWidth, height, width]
    );

    return <Graphics draw={draw} />;
}
