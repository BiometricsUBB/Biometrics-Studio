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
import { MARKING_CLASS, MarkingBase } from "@/lib/markings/MarkingBase";
import { RayMarking } from "@/lib/markings/RayMarking";
import { PointMarking } from "@/lib/markings/PointMarking";
import { LineSegmentMarking } from "@/lib/markings/LineSegmentMarking";
import { MarkingCharacteristicsStore } from "@/lib/stores/MarkingCharacteristics/MarkingCharacteristics";
import {
    defaultBackgroundColor,
    defaultSize,
    defaultTextColor,
    MarkingCharacteristic,
} from "@/lib/markings/MarkingCharacteristic";
import { WorkingModeStore } from "@/lib/stores/WorkingMode";
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

    const markings: MarkingBase[] = fileContentJson.data.markings.map(
        marking => {
            switch (marking.markingClass) {
                case MARKING_CLASS.POINT:
                    return new PointMarking(
                        marking.label,
                        marking.origin,
                        marking.characteristicId
                    );
                case MARKING_CLASS.RAY:
                    return new RayMarking(
                        marking.label,
                        marking.origin,
                        marking.characteristicId,
                        marking.angleRad!
                    );
                case MARKING_CLASS.LINE_SEGMENT:
                    return new LineSegmentMarking(
                        marking.label,
                        marking.origin,
                        marking.characteristicId,
                        marking.endpoint!
                    );
                default:
                    throw new Error(
                        `Unknown marking class: ${marking.markingClass}`
                    );
            }
        }
    );

    const existingCharacteristics =
        MarkingCharacteristicsStore.state.characteristics;

    const requiredCharacteristics = new Map<
        MarkingCharacteristic["id"],
        MARKING_CLASS
    >(
        markings.map(marking => [
            marking.characteristicId,
            marking.markingClass,
        ])
    );

    const missingCharacteristicsIds: string[] = requiredCharacteristics
        .keys()
        .filter(id => !existingCharacteristics.some(c => c.id === id))
        .toArray();

    // If characteristic exists in markings but not in the store
    if (missingCharacteristicsIds.length > 0) {
        const confirmed = await confirmFileSelectionDialog(
            t(
                "The imported markings data contains characteristics that are not present in the application. Would you like to:\n1. Automatically create default characteristics for the missing ones?\n2. Cancel and manually import the characteristics from a file?",
                { ns: "dialog" }
            ),
            {
                kind: "warning",
                title: t("Missing marking characteristics detected", {
                    ns: "dialog",
                }),
            }
        );

        if (!confirmed) return;

        // importing names from metadata
        const metadataCharacteristics =
            fileContentJson.metadata?.characteristics;

        const characteristicsToAdd: MarkingCharacteristic[] = [];
        requiredCharacteristics
            .keys()
            .filter(id => missingCharacteristicsIds.includes(id))
            .forEach(id => {
                const markingClass = requiredCharacteristics.get(id)!;

                const metadataCharacteristicName = metadataCharacteristics.find(
                    o => o.characteristicId === id
                )?.characteristicName;

                // set names according to metadata if non existent use slice of id
                /* 
                    TODO: if characteristicName is not present display a warning and allow user to name it
                    As currently if there is no characteristicName in the import file it will be named as the first 6 characters of the id
                    breaking the convention of the user naming the characteristics 
                */
                characteristicsToAdd.push({
                    id,
                    characteristicName:
                        metadataCharacteristicName ?? id.slice(0, 6),
                    displayName: metadataCharacteristicName ?? id.slice(0, 6),
                    markingClass,
                    backgroundColor: defaultBackgroundColor,
                    textColor: defaultTextColor,
                    size: defaultSize,
                    category: fileContentJson.metadata.workingMode,
                });
            });

        MarkingCharacteristicsStore.actions.characteristics.addMany(
            characteristicsToAdd
        );
    }

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
