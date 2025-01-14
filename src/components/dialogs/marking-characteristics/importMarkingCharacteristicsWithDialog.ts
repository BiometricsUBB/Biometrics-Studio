import { showErrorDialog } from "@/lib/errors/showErrorDialog";
import { getVersion } from "@tauri-apps/api/app";
import {
    confirm as confirmFileSelectionDialog,
    open as openFileSelectionDialog,
} from "@tauri-apps/plugin-dialog";
import { t } from "i18next";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { MarkingCharacteristicsStore } from "@/lib/stores/MarkingCharacteristics/MarkingCharacteristics";
import { MarkingCharacteristicsExportObject } from "@/components/dialogs/marking-characteristics/exportMarkingCharacteristicsWithDialog";
import { validateFileData } from "@/lib/utils/viewport/loadMarkingsData";

export async function loadMarkingCharacteristicsData(filePath: string) {
    const fileContentString = await readTextFile(filePath);
    const fileContentJson = JSON.parse(
        fileContentString
    ) as MarkingCharacteristicsExportObject;
    if (!validateFileData(fileContentJson)) {
        showErrorDialog("Invalid markings data file");
        return;
    }

    const appVersion = await getVersion();

    if (fileContentJson.metadata.software.version !== appVersion) {
        const confirmed = await confirmFileSelectionDialog(
            t(
                "Marking characteristics were exported from a different version of the application ({{version}}). Loading it might not work.\n\nAre you sure you want to load it?",
                {
                    ns: "dialog",
                    version: fileContentJson.metadata.software.version,
                }
            ),
            {
                kind: "warning",
                title: filePath ?? "Are you sure?",
            }
        );
        if (!confirmed) return;
    }

    const characteristics = fileContentJson.data.markingCharacteristics;

    const conflicts = MarkingCharacteristicsStore.actions.characteristics
        .getConflicts(characteristics)
        .map(conflict => conflict.name)
        .join(", ");

    if (conflicts.length > 0) {
        const confirmed = await confirmFileSelectionDialog(
            t(
                "The imported marking characteristics have conflicts with the existing ones:\n{{conflicts}}\n\nDo you want to overwrite them?",
                { ns: "dialog", conflicts }
            ),
            {
                kind: "warning",
                title: t("Overwrite marking characteristics?", {
                    ns: "dialog",
                }),
            }
        );
        if (!confirmed) return;
    }

    MarkingCharacteristicsStore.actions.characteristics.addMany(
        characteristics
    );
}

export async function importMarkingCharacteristicsWithDialog() {
    try {
        const filePath = await openFileSelectionDialog({
            title: t("Import marking characteristics", {
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

        await loadMarkingCharacteristicsData(filePath);
    } catch (error) {
        showErrorDialog(error);
    }
}
