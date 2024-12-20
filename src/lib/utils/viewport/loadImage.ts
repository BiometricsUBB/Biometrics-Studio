import { showErrorDialog } from "@/lib/errors/showErrorDialog";
import {
    confirm as confirmFileSelectionDialog,
    open as openFileSelectionDialog,
} from "@tauri-apps/plugin-dialog";
import { Viewport } from "pixi-viewport";
import { MarkingsStore } from "@/lib/stores/Markings";
import { CanvasMetadata } from "@/components/pixi/canvas/hooks/useCanvasContext";
import {
    emitFitEvents,
    fitWorld,
} from "@/components/pixi/canvas/utils/fit-viewport";
import { ShallowViewportStore } from "@/lib/stores/ShallowViewport";
import { CanvasToolbarStore } from "@/lib/stores/CanvasToolbar";
import { CachedViewportStore } from "@/lib/stores/CachedViewport";
import { getOppositeCanvasId } from "@/components/pixi/canvas/utils/get-opposite-canvas-id";
import { DashboardToolbarStore } from "@/lib/stores/DashboardToolbar";
import { t } from "i18next";
import { loadMarkingsData } from "@/lib/utils/viewport/loadMarkingsData";
import { exists } from "@tauri-apps/plugin-fs";
import { loadSprite } from "./loadSprite";
import { normalizeSpriteSize } from "./normalizeSpriteSize";

export async function loadImage(filePath: string, viewport: Viewport) {
    DashboardToolbarStore.actions.settings.viewport.setLockScaleSync(false);
    DashboardToolbarStore.actions.settings.viewport.setLockedViewport(false);

    const canvasId = viewport.name as CanvasMetadata["id"] | null;
    if (canvasId === null) {
        showErrorDialog(`Canvas ID: ${canvasId} not found`);
        return;
    }

    if (
        viewport.children.length !== 0 ||
        MarkingsStore(canvasId).state.markings.length !== 0
    ) {
        const confirmed = await confirmFileSelectionDialog(
            t(
                "Are you sure you want to load this image?\n\nIt will remove the previously loaded image and all existing forensic marks.",
                { ns: "dialog" }
            ),
            {
                kind: "warning",
                title: filePath ?? "Are you sure?",
            }
        );
        if (!confirmed) return;
    }

    if (viewport.children.length !== 0) viewport.removeChildren();
    const sprite = await loadSprite(filePath);
    viewport.addChild(normalizeSpriteSize(viewport, sprite));

    ShallowViewportStore(canvasId).state.reset();
    CanvasToolbarStore(canvasId).state.reset();
    CachedViewportStore(canvasId).state.reset();
    fitWorld(viewport);
    emitFitEvents(viewport, "fit-world");

    const defaultMarkingsFilePath = `${filePath}.json`;
    if (await exists(defaultMarkingsFilePath)) {
        await loadMarkingsData(defaultMarkingsFilePath, canvasId);
    } else {
        MarkingsStore(canvasId).actions.markings.reset();
        MarkingsStore(canvasId).actions.labelGenerator.reset();
        MarkingsStore(
            getOppositeCanvasId(canvasId)
        ).actions.labelGenerator.reset();
    }
}

export async function loadImageWithDialog(viewport: Viewport) {
    try {
        const filePath = await openFileSelectionDialog({
            title: t("Load forensic mark image", {
                ns: "tooltip",
            }),
            filters: [
                {
                    name: "Images",
                    extensions: ["png", "jpg", "jpeg", "gif", "bmp", "webp"],
                },
            ],
            directory: false,
            canCreateDirectories: false,
            multiple: false,
        });

        if (filePath === null) return;

        await loadImage(filePath, viewport);
    } catch (error) {
        showErrorDialog(error);
    }
}
