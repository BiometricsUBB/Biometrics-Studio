import { ColorSource, Graphics as PixiGraphics } from "pixi.js";
import { RayMarking } from "@/lib/markings/RayMarking";
import { PointMarking } from "@/lib/markings/PointMarking";
import { MARKING_TYPE, MarkingBase, Point } from "@/lib/markings/MarkingBase";
import { BitmapText } from "@pixi/text-bitmap";

export const getFontName = (fontSize: number) => {
    const FONT_FAMILY_NAME = "Cousine";
    const MAX_FONT_SIZE = 32;
    const MIN_FONT_SIZE = 6;
    const clampedFontSize = Math.max(
        MIN_FONT_SIZE,
        Math.min(MAX_FONT_SIZE, Math.ceil(fontSize))
    );

    return `${FONT_FAMILY_NAME} ${clampedFontSize}`;
};

const drawLabel = (
    g: PixiGraphics,
    text: string,
    position: Point,
    size: number,
    textColor: ColorSource
) => {
    const fontSize = Math.ceil(
        (size * 2) / (text.length === 1 ? 1 : text.length * 0.58)
    );
    const fontName = getFontName(fontSize);

    const label = new BitmapText(text, {
        fontName,
        fontSize,
        tint: textColor,
    });
    label.x = position.x;
    label.y = position.y;
    label.anchor.set(0.5, 0.43);

    g.addChild(label);
};

const lineWidth = 2;
const lineLength = 4;
const shadowWidth = 0.5;

const drawPointMarking = (
    g: PixiGraphics,
    selected: boolean,
    { backgroundColor, textColor, size, label }: PointMarking,
    relativeOrigin: Point,
    showMarkingLabels?: boolean
) => {
    const { x, y } = relativeOrigin;

    if (selected) {
        g.lineStyle(1, textColor);
        g.beginFill(0x0000ff, 0.5);
        g.drawRect(x - size - 2, y - size - 2, size * 2 + 4, size * 2 + 4);
    }

    g.lineStyle(shadowWidth, textColor);
    g.drawCircle(x, y, size);
    g.beginFill(backgroundColor);
    g.drawCircle(x, y, size - shadowWidth);
    g.endFill();

    if (showMarkingLabels) {
        drawLabel(g, String(label), relativeOrigin, size, textColor);
    } else {
        g.beginHole();
        g.drawCircle(x, y, size - lineWidth - 1 - shadowWidth);
        g.endHole();
        g.drawCircle(x, y, size - lineWidth - 2 - shadowWidth);
    }
};

const drawRayMarking = (
    g: PixiGraphics,
    selected: boolean,
    { backgroundColor, textColor, size, angleRad, label }: RayMarking,
    relativeOrigin: Point,
    showMarkingLabels?: boolean
) => {
    const { x, y } = relativeOrigin;

    if (selected) {
        g.lineStyle(1, textColor);
        g.beginFill(0x0000ff, 0.5);
        g.drawRect(x - size - 2, y - size - 2, size * 2 + 4, size * 2 + 4);
    }

    const a = new PixiGraphics();
    a.pivot.set(x, y);
    a.rotation = angleRad;

    a.moveTo(x, y - 3 * shadowWidth);
    a.lineStyle(lineWidth + 3 * shadowWidth, textColor);
    a.lineTo(x, y + lineLength * size + 3 * shadowWidth);

    a.moveTo(x, y);
    a.lineStyle(lineWidth, backgroundColor);
    a.lineTo(x, y + lineLength * size);
    a.position.set(x, y);

    g.addChild(a);

    const b = new PixiGraphics();
    b.lineStyle(shadowWidth, textColor);
    b.drawCircle(x, y, size);
    b.beginFill(backgroundColor);
    b.drawCircle(x, y, size - shadowWidth);
    b.endFill();
    if (showMarkingLabels) {
        drawLabel(b, String(label), relativeOrigin, size, textColor);
    } else {
        b.beginHole();
        b.drawCircle(x, y, size - lineWidth - 1 - shadowWidth);
        b.endHole();
        b.drawCircle(x, y, size - lineWidth - 2 - shadowWidth);
    }

    g.addChild(b);
};

export const drawMarking = (
    g: PixiGraphics,
    isSelected: boolean,
    marking: MarkingBase,
    viewportWidthRatio: number,
    viewportHeightRatio: number,
    showMarkingLabels?: boolean
) => {
    const relativeOrigin = marking.getRelativeOrigin(
        viewportWidthRatio,
        viewportHeightRatio
    );
    if (marking.type === MARKING_TYPE.POINT) {
        drawPointMarking(
            g,
            isSelected,
            marking as PointMarking,
            relativeOrigin,
            showMarkingLabels
        );
    } else if (marking.type === MARKING_TYPE.RAY) {
        drawRayMarking(
            g,
            isSelected,
            marking as RayMarking,
            relativeOrigin,
            showMarkingLabels
        );
    } else {
        throw new Error(`Unsupported marking type: ${marking.type}`);
    }
};
