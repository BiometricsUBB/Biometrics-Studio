import { save } from "@tauri-apps/plugin-dialog";
import { getVersion } from "@tauri-apps/api/app";
import { t } from "i18next";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { showErrorDialog } from "@/lib/errors/showErrorDialog";
import { desktopDir, join } from "@tauri-apps/api/path";
import { MarkingCharacteristic } from "@/lib/markings/MarkingCharacteristic";
import { MarkingCharacteristicsStore } from "@/lib/stores/MarkingCharacteristics/MarkingCharacteristics";

type SoftwareInfo = {
    name: string;
    version: string;
};

export type MarkingCharacteristicsExportObject = {
    metadata: {
        software: SoftwareInfo;
    };
    data: {
        markingCharacteristics: MarkingCharacteristic[];
    };
};

async function getData(): Promise<string> {
    const exportObject: MarkingCharacteristicsExportObject = {
        metadata: {
            software: {
                name: "biometrics-studio",
                version: await getVersion(),
            },
        },
        data: {
            markingCharacteristics:
                MarkingCharacteristicsStore.state.characteristics,
        },
    };

    return JSON.stringify(exportObject, null, 2);
}

export async function exportMarkingCharacteristicsWithDialog() {
    try {
        const filepath = await save({
            title: t("Export marking characteristics", {
                ns: "tooltip",
            }),
            filters: [
                {
                    name: "JSON",
                    extensions: ["json"],
                },
            ],
            canCreateDirectories: true,
            defaultPath: await join(
                await desktopDir(),
                "marking-characteristics.json"
            ),
        });

        if (filepath === null) return;

        const data = await getData();
        await writeTextFile(filepath, data);
    } catch (error) {
        showErrorDialog(error);
    }
}
