/* eslint-disable no-throw-literal */

import { showErrorDialog } from "@/lib/errors/showErrorDialog";
import { confirm } from "@tauri-apps/plugin-dialog";
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
import { loadSprite } from "./loadSprite";
import { normalizeSpriteSize } from "./normalizeSpriteSize";

export async function readableStreamToUint8Array(
    stream: ReadableStream<Uint8Array>
): Promise<Uint8Array> {
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];
    let totalLength = 0;

    // eslint-disable-next-line no-constant-condition
    while (true) {
        // eslint-disable-next-line no-await-in-loop
        const { done, value } = await reader.read();
        if (done) {
            break;
        }
        if (value) {
            chunks.push(value);
            totalLength += value.length;
        }
    }

    const result = new Uint8Array(totalLength);
    let offset = 0;
    chunks.forEach(chunk => {
        result.set(chunk, offset);
        offset += chunk.length;
    });
    return result;
}

export async function loadImageFromFile(
    viewport: Viewport,
    file: File | undefined
) {
    try {
        if (typeof file === "undefined") throw new Error("No file provided");

        DashboardToolbarStore.actions.settings.viewport.setLockScaleSync(false);
        DashboardToolbarStore.actions.settings.viewport.setLockedViewport(
            false
        );

        const id = viewport.name as CanvasMetadata["id"] | null;
        if (id === null) throw new Error(`Canvas ID: ${id} not found`);

        if (
            viewport.children.length !== 0 ||
            MarkingsStore(id).state.markings.length !== 0
        ) {
            const confirmed = await confirm(
                "Are you sure you want to load this image?\n\nIt will remove the previously loaded image and all existing forensic marks.",
                {
                    kind: "warning",
                    title: file.name ?? "Are you sure?",
                }
            );
            if (!confirmed) throw "cancel";
        }

        const sprite = await loadSprite(
            await readableStreamToUint8Array(file.stream()),
            file.name
        );

        const normalizedSprite = normalizeSpriteSize(viewport, sprite);

        if (viewport.children.length !== 0) viewport.removeChildren();

        const isOppositeCanvasEmpty =
            MarkingsStore(getOppositeCanvasId(id)).state.markings.length === 0;

        MarkingsStore(id).actions.markings.reset();
        if (isOppositeCanvasEmpty) {
            MarkingsStore(
                getOppositeCanvasId(id)
            ).actions.labelGenerator.reset();
        }
        MarkingsStore(id).actions.labelGenerator.reset();
        ShallowViewportStore(id).state.reset();
        CanvasToolbarStore(id).state.reset();
        CachedViewportStore(id).state.reset();

        viewport.addChild(normalizedSprite);

        fitWorld(viewport);
        emitFitEvents(viewport);
    } catch (error) {
        if (typeof error === "string" && error === "cancel") return;

        showErrorDialog(error);
    }
}
