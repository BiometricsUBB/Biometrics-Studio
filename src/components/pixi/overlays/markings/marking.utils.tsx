/* eslint-disable sonarjs/prefer-single-boolean-return */
/* eslint-disable no-param-reassign */
import { InternalMarking, RenderableMarking } from "@/lib/stores/Markings";
import {
    AlphaFilter,
    Application,
    ICanvas,
    Graphics as PixiGraphics,
} from "pixi.js";
import { Viewport as PixiViewport } from "pixi-viewport";
import { GlobalSettingsStore } from "@/lib/stores/GlobalSettings";

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
    marking: InternalMarking,
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
            case "auto":
                if (markingsLength < 100) return 2 * VERY_HIGH;
                if (markingsLength < 200) return VERY_HIGH;
                if (markingsLength < 500) return HIGH;
                if (markingsLength < 1000) return MEDIUM;
                return LOW;
            case "none":
                return NONE;
            case "low":
                return LOW;
            case "medium":
                return MEDIUM;
            case "high":
                return HIGH;
            case "very high":
                return VERY_HIGH;
            default:
                return HIGH;
        }
    })();

    const { x, y } = marking.position;

    if (x + viewport.x < app.screen.left - PRERENDER_MARGIN) return false;
    if (y + viewport.y < app.screen.top - PRERENDER_MARGIN) return false;
    if (x + viewport.x > app.screen.right + PRERENDER_MARGIN) return false;
    if (y + viewport.y > app.screen.bottom + PRERENDER_MARGIN) return false;

    return true;
}

export const drawMarking = (
    g: PixiGraphics,
    {
        visible,
        backgroundColor,
        textColor,
        position: { x, y },
        size,
        type,
        angleRad,
    }: RenderableMarking,
    alpha: number = 1
) => {
    if (!visible) return;
    g.beginFill(backgroundColor);
    g.lineStyle(1, textColor);
    g.drawCircle(x, y, size);
    g.endFill();
    if (type === "ray") {
        const a = new PixiGraphics();
        a.beginFill(backgroundColor);

        a.pivot.set(x, y);
        a.rotation = angleRad;

        a.drawPolygon([x, y, x + size, y, x, y + 2 * size, x - size, y]);

        a.lineStyle(1, textColor);

        a.moveTo(x + size, y);
        a.quadraticCurveTo(x + size, y + size, x, y + 2 * size);
        a.moveTo(x - size, y);
        a.quadraticCurveTo(x - size, y + size, x, y + 2 * size);

        a.position.set(x, y);
        a.zIndex = 0;
        g.addChild(a);
    }

    g.filters = [];

    if (alpha !== 1) {
        g.filters.push(new AlphaFilter(alpha));
    }
};
