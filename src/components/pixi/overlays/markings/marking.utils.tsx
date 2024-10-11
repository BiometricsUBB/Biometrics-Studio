import { Application, ICanvas, Graphics as PixiGraphics } from "pixi.js";
import { Viewport as PixiViewport } from "pixi-viewport";
import {
    GlobalSettingsStore,
    PRERENDER_RADIUS_OPTIONS,
} from "@/lib/stores/GlobalSettings";
import { RayMarking } from "@/lib/markings/RayMarking";
import { PointMarking } from "@/lib/markings/PointMarking";
import { MarkingBase } from "@/lib/markings/MarkingBase";

export const getFontName = (fontSize: number) => {
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

export function isVisible(
    marking: MarkingBase,
    markingsLength: number,
    app: Application<ICanvas> | null,
    viewport: PixiViewport | null
): boolean {
    if (viewport === null || app === null) return false;
    const NONE = 0;
    const LOW = 200;
    const MEDIUM = 500;
    const HIGH = 900;
    const VERY_HIGH = 1200;

    const PRERENDER_MARGIN = (() => {
        switch (
            GlobalSettingsStore.state.settings.video.rendering.prerenderRadius
        ) {
            case PRERENDER_RADIUS_OPTIONS.AUTO:
                if (markingsLength < 100) return 2 * VERY_HIGH;
                if (markingsLength < 200) return VERY_HIGH;
                if (markingsLength < 500) return HIGH;
                if (markingsLength < 1000) return MEDIUM;
                return LOW;
            case PRERENDER_RADIUS_OPTIONS.NONE:
                return NONE;
            case PRERENDER_RADIUS_OPTIONS.LOW:
                return LOW;
            case PRERENDER_RADIUS_OPTIONS.MEDIUM:
                return MEDIUM;
            case PRERENDER_RADIUS_OPTIONS.HIGH:
                return HIGH;
            case PRERENDER_RADIUS_OPTIONS.VERY_HIGH:
                return VERY_HIGH;
            default:
                return HIGH;
        }
    })();

    const { x, y } = marking.origin;
    // TODO: Prawdopodobnie trzeba będzie docelowo sprawdzać dowolna część oznaczenia jest widoczna (np. przy odcinku)

    if (x + viewport.x < app.screen.left - PRERENDER_MARGIN) return false;
    if (y + viewport.y < app.screen.top - PRERENDER_MARGIN) return false;
    if (x + viewport.x > app.screen.right + PRERENDER_MARGIN) return false;
    return !(y + viewport.y > app.screen.bottom + PRERENDER_MARGIN);
}

export const drawPointMarking = (
    g: PixiGraphics,
    selected: boolean,
    {
        hidden,
        visible,
        backgroundColor,
        textColor,
        origin: { x, y },
        size,
    }: PointMarking,
    showMarkingLabels?: boolean,
    lineWidth: number = 2,
    shadowWidth: number = 0.5
) => {
    if (!visible || hidden) return;

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

    if (!showMarkingLabels) {
        g.beginHole();
        g.drawCircle(x, y, size - lineWidth - 1 - shadowWidth);
        g.endHole();
        g.drawCircle(x, y, size - lineWidth - 2 - shadowWidth);
    }
};

export const drawRayMarking = (
    g: PixiGraphics,
    selected: boolean,
    {
        hidden,
        visible,
        backgroundColor,
        textColor,
        origin: { x, y },
        size,
        angleRad,
    }: RayMarking,
    showMarkingLabels?: boolean,
    lineWidth: number = 2,
    shadowWidth: number = 0.5,
    lineLength: number = 4
) => {
    if (!visible || hidden) return;

    if (selected) {
        g.lineStyle(1, textColor);
        g.beginFill(0x0000ff, 0.5);
        g.drawRect(x - size - 2, y - size - 2, size * 2 + 4, size * 2 + 4);
    }

    if (angleRad !== null) {
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
    }

    const b = new PixiGraphics();
    b.lineStyle(shadowWidth, textColor);
    b.drawCircle(x, y, size);
    b.beginFill(backgroundColor);
    b.drawCircle(x, y, size - shadowWidth);
    b.endFill();

    if (!showMarkingLabels) {
        b.beginHole();
        b.drawCircle(x, y, size - lineWidth - 1 - shadowWidth);
        b.endHole();
        b.drawCircle(x, y, size - lineWidth - 2 - shadowWidth);
    }

    g.addChild(b);
};
