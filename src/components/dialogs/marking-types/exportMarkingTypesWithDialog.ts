import { save } from "@tauri-apps/plugin-dialog";
import { getVersion } from "@tauri-apps/api/app";
import { t } from "i18next";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { desktopDir, join } from "@tauri-apps/api/path";
import { MarkingType } from "@/lib/markings/MarkingType";
import { MarkingTypesStore } from "@/lib/stores/MarkingTypes/MarkingTypes";
import { WorkingModeStore } from "@/lib/stores/WorkingMode";
import { toast } from "sonner";

type SoftwareInfo = {
    name: string;
    version: string;
};

export type MarkingTypesExportObject = {
    metadata: {
        software: SoftwareInfo;
    };
    data: {
        markingTypes: MarkingType[];
    };
};

async function getData(): Promise<string> {
    const exportObject: MarkingTypesExportObject = {
        metadata: {
            software: {
                name: "biometrics-studio",
                version: await getVersion(),
            },
        },
        data: {
            markingTypes: MarkingTypesStore.state.types.filter(
                c => c.category === WorkingModeStore.state.workingMode
            ),
        },
    };

    return JSON.stringify(exportObject, null, 2);
}

export async function exportMarkingTypesWithDialog() {
    try {
        const filepath = await save({
            title: t("Export marking types", {
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
                `marking-types-${WorkingModeStore.state.workingMode?.toLowerCase()}.json`
            ),
        });

        if (filepath === null) return;

        const data = await getData();
        await writeTextFile(filepath, data);
        toast.success(
            t("Marking types exported successfully", { ns: "dialog" })
        );
    } catch {
        toast.error(t("Error exporting marking types", { ns: "dialog" }));
    }
}
