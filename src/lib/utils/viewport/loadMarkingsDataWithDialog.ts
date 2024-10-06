/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable no-throw-literal */
import { CanvasMetadata } from "@/components/pixi/canvas/hooks/useCanvasContext";
import { showErrorDialog } from "@/lib/errors/showErrorDialog";
import { Marking, MarkingsStore } from "@/lib/stores/Markings";
import { getVersion } from "@tauri-apps/api/app";
import { open, confirm } from "@tauri-apps/plugin-dialog";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { t } from "i18next";
import { Viewport } from "pixi-viewport";
import { getOppositeCanvasId } from "@/components/pixi/canvas/utils/get-opposite-canvas-id";
import { ExportObject } from "./saveMarkingsDataWithDialog";

function validateFileData(_data: unknown): _data is ExportObject {
    const filedata = _data as ExportObject;
    return (
        typeof filedata === "object" &&
        filedata !== null &&
        "software" in filedata.metadata &&
        "name" in filedata.metadata.software &&
        filedata.metadata.software.name === "bioparallel" &&
        "version" in filedata.metadata.software
    );
}

function inferMarking(
    marking: ExportObject["data"]["markings"][0],
    markingStyleTypes: ExportObject["data"]["marking_types"]
): Marking {
    const {
        background_color: backgroundColor,
        size,
        text_color: textColor,
        type,
    } = markingStyleTypes.find(t => t.typeId === marking.typeId)!;

    const { typeId, angleRad, ...props } = marking;

    // eslint-disable-next-line no-void
    void { typeId };

    return {
        backgroundColor,
        textColor,
        size,
        type,
        hidden: false,
        angleRad: angleRad ?? null,
        ...props,
    };
}

export async function loadMarkingsDataWithDialog(viewport: Viewport) {
    try {
        const path = await open({
            title: t("Load markings data from file", {
                ns: "tooltip",
            }),
            filters: [
                {
                    name: "Markings data file",
                    // TODO: add .xyt
                    extensions: ["json"],
                },
            ],
            directory: false,
            canCreateDirectories: false,
            multiple: false,
        });

        if (path === null) throw "cancel";

        const id = viewport.name as CanvasMetadata["id"] | null;
        if (id === null) throw new Error(`Canvas ID: ${id} not found`);

        const file = await readTextFile(path);
        const filedata: unknown = JSON.parse(file);
        if (!validateFileData(filedata)) {
            throw new Error("Invalid markings data file");
        }

        const appVersion = await getVersion();

        if (filedata.metadata.software.version !== appVersion) {
            const confirmed = confirm(
                `The markings data was created with a different version of the application (${filedata.metadata.software.version}). Loading it might not work.\n\nAre you sure you want to load it?`,
                {
                    kind: "warning",
                    title: path ?? "Are you sure?",
                }
            );
            if (!confirmed) throw "cancel";
        }

        if (MarkingsStore(id).state.markings.length !== 0) {
            const confirmed = confirm(
                "Are you sure you want to load this image?\n\nIt will remove the previously loaded image and all existing forensic marks.",
                {
                    kind: "warning",
                    title: path ?? "Are you sure?",
                }
            );
            if (!confirmed) throw "cancel";
        }

        const markingStyleTypes = filedata.data.marking_types;

        const markings: Marking[] = filedata.data.markings.map(marking =>
            inferMarking(marking, markingStyleTypes)
        );

        const isOppositeCanvasEmpty =
            MarkingsStore(getOppositeCanvasId(id)).state.markings.length === 0;

        MarkingsStore(id).actions.markings.reset();
        if (isOppositeCanvasEmpty) {
            MarkingsStore(
                getOppositeCanvasId(id)
            ).actions.labelGenerator.reset();
        }
        MarkingsStore(id).actions.markings.addMany(markings);
    } catch (error) {
        if (typeof error === "string" && error === "cancel") return;

        showErrorDialog(error);
    }
}
