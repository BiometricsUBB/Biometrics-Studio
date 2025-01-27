import {
    ColorSource,
    Graphics as PixiGraphics,
    TextStyle,
    Text,
} from "pixi.js";
import { RayMarking } from "@/lib/markings/RayMarking";
import { PointMarking } from "@/lib/markings/PointMarking";
import { MarkingBase, Point } from "@/lib/markings/MarkingBase";
import { BitmapText } from "@pixi/text-bitmap";
import { LineSegmentMarking } from "@/lib/markings/LineSegmentMarking";
import { MarkingCharacteristic } from "@/lib/markings/MarkingCharacteristic";
import { BoundingBoxMarking } from "@/lib/markings/BoundingBoxMarking";

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
    { label }: PointMarking,
    { backgroundColor, textColor, size }: MarkingCharacteristic,
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
    { angleRad, label }: RayMarking,
    { backgroundColor, textColor, size }: MarkingCharacteristic,
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

const drawLineSegmentMarking = (
    g: PixiGraphics,
    selected: boolean,
    { label }: LineSegmentMarking,
    { backgroundColor, textColor, size }: MarkingCharacteristic,
    relativeOrigin: Point,
    relativeEndpoint: Point,
    showMarkingLabels?: boolean
) => {
    const { x, y } = relativeOrigin;
    const { x: ex, y: ey } = relativeEndpoint;

    if (selected) {
        g.lineStyle(1, textColor);
        g.beginFill(0x0000ff, 0.5);
        g.drawRect(x - size - 2, y - size - 2, size * 2 + 4, size * 2 + 4);
    }

    const origin = new PixiGraphics();
    // Origin outline
    origin.lineStyle(shadowWidth, textColor).drawCircle(x, y, size);
    // Origin
    origin
        .beginFill(backgroundColor)
        .drawCircle(x, y, size - shadowWidth)
        .endFill();

    const line = new PixiGraphics();
    // Line outline
    line.moveTo(x, y)
        .lineStyle(lineWidth + 3 * shadowWidth, textColor)
        .lineTo(ex, ey);
    // Line
    line.moveTo(x, y).lineStyle(lineWidth, backgroundColor).lineTo(ex, ey);

    const endpoint = new PixiGraphics();
    // Endpoint outline
    endpoint.lineStyle(shadowWidth, textColor).drawCircle(ex, ey, size);
    // Endpoint
    endpoint
        .beginFill(backgroundColor)
        .drawCircle(ex, ey, size - shadowWidth)
        .endFill();
    // Endpoint hole
    endpoint
        .beginHole()
        .drawCircle(ex, ey, size - lineWidth - 1 - shadowWidth)
        .drawCircle(ex, ey, size - lineWidth - 2 - shadowWidth)
        .endHole();

    if (showMarkingLabels) {
        // Label at origin position
        drawLabel(origin, String(label), relativeOrigin, size, textColor);
    } else {
        // Origin hole
        origin.beginHole();
        origin.drawCircle(x, y, size - lineWidth - 1 - shadowWidth);
        origin.endHole();
        origin.drawCircle(x, y, size - lineWidth - 2 - shadowWidth);
    }

    g.addChild(line);
    g.addChild(origin);
    g.addChild(endpoint);
};

const drawBoundingBoxMarking = (
    g: PixiGraphics,
    selected: boolean,
    { label }: BoundingBoxMarking,
    { backgroundColor, textColor, size }: MarkingCharacteristic,
    relativeOrigin: Point,
    relativeEndpoint: Point,
    showMarkingLabels?: boolean
) => {
    const { x, y } = relativeOrigin;
    const { x: ex, y: ey } = relativeEndpoint;

    const rectX = Math.min(x, ex);
    const rectY = Math.min(y, ey);
    const rectWidth = Math.abs(ex - x);
    const rectHeight = Math.abs(ey - y);

    if (selected) {
        g.lineStyle(1, textColor);
        g.beginFill(0x0000ff, 0.5);
        g.drawRect(
            rectX - size - 2,
            rectY - size - 2,
            rectWidth + size * 2 + 4,
            rectHeight + size * 2 + 4
        );
    }

    // Bounding box outline
    g.lineStyle(2, textColor);
    g.drawRect(rectX, rectY, rectWidth, rectHeight);

    // Bounding box fill
    g.beginFill(backgroundColor, 0.3);
    g.drawRect(rectX, rectY, rectWidth, rectHeight);
    g.endFill();

    if (showMarkingLabels) {
        const labelPadding = 4;
        const labelText = String(label);
        const hexTextColor = `${textColor.toString(16).padStart(6, "0")}`;

        const textStyle = new TextStyle({
            fontSize: size * 1.5,
            fill: hexTextColor,
            fontWeight: "bold",
        });

        const labelTextObj = new Text(labelText, textStyle);

        const labelWidth = labelTextObj.width + labelPadding * 2;
        const labelHeight = labelTextObj.height + labelPadding;

        g.beginFill(backgroundColor, 1);
        g.drawRect(rectX, rectY - labelHeight, labelWidth, labelHeight);
        g.endFill();

        labelTextObj.x = rectX + labelPadding;
        labelTextObj.y = rectY - labelHeight + labelPadding / 2;

        g.addChild(labelTextObj);
    }
};

export const drawMarking = (
    g: PixiGraphics,
    isSelected: boolean,
    marking: MarkingBase,
    markingCharacteristic: MarkingCharacteristic,
    viewportWidthRatio: number,
    viewportHeightRatio: number,
    showMarkingLabels?: boolean
) => {
    // Calculate the viewport position of the marking, based on zoom level
    const markingViewportPosition = marking.calculateOriginViewportPosition(
        viewportWidthRatio,
        viewportHeightRatio
    );

    if (marking instanceof PointMarking) {
        drawPointMarking(
            g,
            isSelected,
            marking,
            markingCharacteristic,
            markingViewportPosition,
            showMarkingLabels
        );
    } else if (marking instanceof RayMarking) {
        drawRayMarking(
            g,
            isSelected,
            marking,
            markingCharacteristic,
            markingViewportPosition,
            showMarkingLabels
        );
    } else if (marking instanceof LineSegmentMarking) {
        drawLineSegmentMarking(
            g,
            isSelected,
            marking,
            markingCharacteristic,
            markingViewportPosition,
            marking.calculateEndpointViewportPosition(
                viewportWidthRatio,
                viewportHeightRatio
            ),
            showMarkingLabels
        );
    } else if (marking instanceof BoundingBoxMarking) {
        drawBoundingBoxMarking(
            g,
            isSelected,
            marking,
            markingCharacteristic,
            markingViewportPosition,
            marking.calculateEndpointViewportPosition(
                viewportWidthRatio,
                viewportHeightRatio
            ),
            showMarkingLabels
        );
    } else {
        throw new Error(`Unsupported marking class: ${marking.markingClass}`);
    }
};
