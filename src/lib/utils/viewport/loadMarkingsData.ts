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
import { MarkingClass } from "@/lib/markings/MarkingClass";
import { RayMarking } from "@/lib/markings/RayMarking";
import { PointMarking } from "@/lib/markings/PointMarking";
import { LineSegmentMarking } from "@/lib/markings/LineSegmentMarking";
import { MarkingTypesStore } from "@/lib/stores/MarkingTypes/MarkingTypes";
import {
    defaultBackgroundColor,
    defaultSize,
    defaultTextColor,
    MarkingType,
} from "@/lib/markings/MarkingType";
import { WorkingModeStore } from "@/lib/stores/WorkingMode";
import { BoundingBoxMarking } from "@/lib/markings/BoundingBoxMarking";
import { MARKING_CLASS } from "@/lib/markings/MARKING_CLASS";
import { ExportObject } from "./saveMarkingsDataWithDialog";

export function validateFileData(_data: unknown): _data is ExportObject {
    const fileData = _data as ExportObject;
    return (
        typeof fileData === "object" &&
        fileData !== null &&
        "software" in fileData.metadata &&
        "name" in fileData.metadata.software &&
        fileData.metadata.software.name === "biometrics-studio" &&
        "version" in fileData.metadata.software
    );
}

export async function loadMarkingsData(filePath: string, canvasId: CANVAS_ID) {
    const fileContentString = await readTextFile(filePath);
    const fileContentJson: unknown = JSON.parse(fileContentString);
    if (!validateFileData(fileContentJson)) {
        showErrorDialog(t("Invalid markings data file", { ns: "dialog" }));
        return;
    }

    const appVersion = await getVersion();

    const versionMismatch =
        fileContentJson.metadata.software.version !== appVersion;

    if (versionMismatch) {
        const confirmed = await confirmFileSelectionDialog(
            t(
                "The markings data was created with a different version of the application ({{version}}). Loading it might not work.\n\nAre you sure you want to load it?",
                {
                    ns: "dialog",
                    version: fileContentJson.metadata.software.version,
                }
            ),
            {
                kind: "warning",
                title: filePath ?? t("Are you sure?", { ns: "dialog" }),
            }
        );
        if (!confirmed) return;
    }

    if (
        fileContentJson.metadata.workingMode !==
        WorkingModeStore.state.workingMode
    ) {
        showErrorDialog(
            t(
                "The markings data was created with a different working mode ({{mode}}). Change the working mode to ({{mode}}) to load the data.",
                {
                    ns: "dialog",
                    mode: fileContentJson.metadata.workingMode,
                }
            )
        );
        return;
    }

    const markings: MarkingClass[] = fileContentJson.data.markings.map(
        marking => {
            switch (marking.markingClass) {
                case MARKING_CLASS.POINT:
                    return new PointMarking(
                        marking.label,
                        marking.origin,
                        marking.typeId
                    );
                case MARKING_CLASS.RAY:
                    return new RayMarking(
                        marking.label,
                        marking.origin,
                        marking.typeId,
                        marking.angleRad!
                    );
                case MARKING_CLASS.LINE_SEGMENT:
                    return new LineSegmentMarking(
                        marking.label,
                        marking.origin,
                        marking.typeId,
                        marking.endpoint!
                    );
                case MARKING_CLASS.BOUNDING_BOX:
                    return new BoundingBoxMarking(
                        marking.label,
                        marking.origin,
                        marking.typeId,
                        marking.endpoint!
                    );
                default:
                    throw new Error(
                        `Unknown marking class: ${marking.markingClass}`
                    );
            }
        }
    );

    const existingtypes = MarkingTypesStore.state.types;

    const requiredTypes = new Map<MarkingType["id"], MARKING_CLASS>(
        markings.map(marking => [marking.typeId, marking.markingClass])
    );

    const missingtypesIds: string[] = requiredTypes
        .keys()
        .filter(id => !existingtypes.some(c => c.id === id))
        .toArray();

    // If type exists in markings but not in the store
    if (missingtypesIds.length > 0) {
        const confirmed = await confirmFileSelectionDialog(
            t(
                "The imported markings data contains types that are not present in the application. Would you like to:\n1. Automatically create default types for the missing ones?\n2. Cancel and manually import the types from a file?",
                { ns: "dialog" }
            ),
            {
                kind: "warning",
                title: t("Missing marking types detected", {
                    ns: "dialog",
                }),
            }
        );

        if (!confirmed) return;

        // importing names from metadata
        const metadataTypes = fileContentJson.metadata?.types;

        const typesToAdd: MarkingType[] = [];
        requiredTypes
            .keys()
            .filter(id => missingtypesIds.includes(id))
            .forEach(id => {
                const markingClass = requiredTypes.get(id)!;

                const metadataTypeName = metadataTypes.find(
                    o => o.id === id
                )?.name;

                // set names according to metadata if non-existent use slice of id
                /* 
                    TODO: if typeName is not present display a warning and allow user to name it
                    As currently if there is no typeName in the import file it will be named as the first 6 characters of the id
                    breaking the convention of the user naming the types 
                */
                typesToAdd.push({
                    id,
                    name: metadataTypeName ?? id.slice(0, 6),
                    displayName: metadataTypeName ?? id.slice(0, 6),
                    markingClass,
                    backgroundColor: defaultBackgroundColor,
                    textColor: defaultTextColor,
                    size: defaultSize,
                    category: fileContentJson.metadata.workingMode,
                });
            });

        MarkingTypesStore.actions.types.addMany(typesToAdd);
    }

    MarkingsStore(canvasId).actions.markings.resetForLoading();
    MarkingsStore(canvasId).actions.markings.addManyForLoading(markings);
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
