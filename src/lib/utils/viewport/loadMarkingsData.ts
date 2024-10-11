import {
    CANVAS_ID,
    CanvasMetadata,
} from "@/components/pixi/canvas/hooks/useCanvasContext";
import { showErrorDialog } from "@/lib/errors/showErrorDialog";
import { MarkingsStore } from "@/lib/stores/Markings";
import { getVersion } from "@tauri-apps/api/app";
import {
    confirm as confirmFileSelectionDialog,
    open as openFileSelectionDialog,
} from "@tauri-apps/plugin-dialog";
import { t } from "i18next";
import { Viewport } from "pixi-viewport";
import { getOppositeCanvasId } from "@/components/pixi/canvas/utils/get-opposite-canvas-id";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { MARKING_TYPE, MarkingBase } from "@/lib/markings/MarkingBase";
import { RayMarking } from "@/lib/markings/RayMarking";
import { PointMarking } from "@/lib/markings/PointMarking";
import { ExportObject } from "./saveMarkingsDataWithDialog";

function validateFileData(_data: unknown): _data is ExportObject {
    const fileData = _data as ExportObject;
    return (
        typeof fileData === "object" &&
        fileData !== null &&
        "software" in fileData.metadata &&
        "name" in fileData.metadata.software &&
        fileData.metadata.software.name === "bioparallel" &&
        "version" in fileData.metadata.software
    );
}

function inferMarking(
    marking: ExportObject["data"]["markings"][0],
    markingStyleTypes: ExportObject["data"]["marking_types"]
): MarkingBase {
    const {
        background_color: backgroundColor,
        size,
        text_color: textColor,
        type,
    } = markingStyleTypes.find(t => t.typeId === marking.typeId)!;

    const { typeId, ...props } = marking;

    // eslint-disable-next-line no-void
    void { typeId };
    // TODO: Co z tym zrobić?

    if (type === MARKING_TYPE.RAY) {
        return new RayMarking(
            "",
            marking.label,
            props.origin,
            false,
            true,
            backgroundColor,
            textColor,
            size,
            "",
            marking.angleRad!
        );
    }
    if (type === MARKING_TYPE.POINT) {
        return new PointMarking(
            "",
            marking.label,
            props.origin,
            false,
            true,
            backgroundColor,
            textColor,
            size,
            ""
        );
    }

    throw new Error(`Unknown marking type: ${type}`);
}

export async function loadMarkingsData(filePath: string, canvasId: CANVAS_ID) {
    const fileContentString = await readTextFile(filePath);
    const fileContentJson: unknown = JSON.parse(fileContentString);
    if (!validateFileData(fileContentJson)) {
        showErrorDialog("Invalid markings data file");
        return;
    }

    const appVersion = await getVersion();

    if (
        fileContentJson.metadata.software.version !== appVersion ||
        MarkingsStore(canvasId).state.markings.length !== 0
    ) {
        const confirmed = await confirmFileSelectionDialog(
            fileContentJson.metadata.software.version !== appVersion
                ? t(
                      "The markings data was created with a different version of the application ({{version}}). Loading it might not work.\n\nAre you sure you want to load it?",
                      {
                          ns: "dialog",
                          version: fileContentJson.metadata.software.version,
                      }
                  )
                : t(
                      "Are you sure you want to load markings data?\n\nIt will remove all existing forensic marks.",
                      { ns: "dialog" }
                  ),
            {
                kind: "warning",
                title: filePath ?? "Are you sure?",
            }
        );
        if (!confirmed) return;
    }

    const markings: MarkingBase[] = fileContentJson.data.markings.map(marking =>
        inferMarking(marking, fileContentJson.data.marking_types)
    );

    MarkingsStore(canvasId).actions.markings.reset();
    MarkingsStore(canvasId).actions.markings.addMany(markings);
    MarkingsStore(canvasId).actions.labelGenerator.reset();
    MarkingsStore(getOppositeCanvasId(canvasId)).actions.labelGenerator.reset();
}

export async function loadMarkingsDataWithDialog(viewport: Viewport) {
    try {
        const filePath = await openFileSelectionDialog({
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

        if (filePath === null) return;

        const canvasId = viewport.name as CanvasMetadata["id"] | null;
        if (canvasId === null) {
            showErrorDialog(`Canvas ID: ${canvasId} not found`);
            return;
        }

        await loadMarkingsData(filePath, canvasId);
    } catch (error) {
        showErrorDialog(error);
    }
}
