import {
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogOverlay,
    DialogPortal,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils/shadcn";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { Toggle } from "@/components/ui/toggle";
import { MarkingCharacteristicsStore } from "@/lib/stores/MarkingCharacteristics/MarkingCharacteristics";
import {
    defaultBackgroundColor,
    defaultSize,
    defaultTextColor,
    WORKING_MODE,
} from "@/lib/markings/MarkingCharacteristic";
import { Download, Plus, Upload, X } from "lucide-react";
import { ICON } from "@/lib/utils/const";
import MarkingCharacteristicsTable from "@/components/dialogs/marking-characteristics/marking-characteristics-table";
import { MARKING_TYPE } from "@/lib/markings/MarkingBase";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuPortal,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportMarkingCharacteristicsWithDialog } from "@/components/dialogs/marking-characteristics/exportMarkingCharacteristicsWithDialog";
import { importMarkingCharacteristicsWithDialog } from "@/components/dialogs/marking-characteristics/importMarkingCharacteristicsWithDialog";
import { useTranslation } from "react-i18next";

function MarkingCharacteristicsDialogPortal() {
    const { t } = useTranslation();

    return (
        <DialogPortal>
            <DialogOverlay />
            <DialogContent className={cn("")}>
                <VisuallyHidden asChild>
                    <DialogTitle className={cn("text-2xl")}>
                        {t("Characteristics")}
                    </DialogTitle>
                </VisuallyHidden>

                {/* Toolbar */}
                <div className="flex justify-between pb-1">
                    <div className="flex flex-row gap-1">
                        {/* Add new characteristic */}
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                title={t("Add")}
                                className={cn("h-6 w-6", "border border-input")}
                            >
                                <Plus
                                    size={ICON.SIZE}
                                    strokeWidth={ICON.STROKE_WIDTH}
                                />
                            </DropdownMenuTrigger>

                            <DropdownMenuPortal>
                                <DropdownMenuContent>
                                    {(
                                        Object.keys(
                                            MARKING_TYPE
                                        ) as (keyof typeof MARKING_TYPE)[]
                                    ).map(key => {
                                        return (
                                            <DropdownMenuItem
                                                key={key}
                                                onClick={() =>
                                                    MarkingCharacteristicsStore.actions.characteristics.add(
                                                        {
                                                            id: crypto.randomUUID(),
                                                            name: t(
                                                                `Marking.Keys.type.Keys.${MARKING_TYPE[key]}`,
                                                                { ns: "object" }
                                                            ),
                                                            type: MARKING_TYPE[
                                                                key
                                                            ],
                                                            backgroundColor:
                                                                defaultBackgroundColor,
                                                            textColor:
                                                                defaultTextColor,
                                                            size: defaultSize,
                                                            category:
                                                                // TODO Get current working mode
                                                                WORKING_MODE.FINGERPRINT,
                                                        }
                                                    )
                                                }
                                            >
                                                {t(
                                                    `Marking.Keys.type.Keys.${MARKING_TYPE[key]}`,
                                                    { ns: "object" }
                                                )}
                                            </DropdownMenuItem>
                                        );
                                    })}
                                </DropdownMenuContent>
                            </DropdownMenuPortal>
                        </DropdownMenu>

                        {/* Import characteristics from file */}
                        <Toggle
                            title={t("Import marking characteristics", {
                                ns: "tooltip",
                            })}
                            size="icon"
                            variant="outline"
                            pressed={false}
                            onClickCapture={() =>
                                importMarkingCharacteristicsWithDialog()
                            }
                        >
                            <Download
                                size={ICON.SIZE}
                                strokeWidth={ICON.STROKE_WIDTH}
                            />
                        </Toggle>

                        {/* Export characteristics to json */}
                        <Toggle
                            title={t("Export marking characteristics", {
                                ns: "tooltip",
                            })}
                            size="icon"
                            variant="outline"
                            pressed={false}
                            onClickCapture={() =>
                                exportMarkingCharacteristicsWithDialog()
                            }
                        >
                            <Upload
                                size={ICON.SIZE}
                                strokeWidth={ICON.STROKE_WIDTH}
                            />
                        </Toggle>
                    </div>

                    <div>
                        {/* Close dialog */}
                        <DialogClose>
                            <div aria-label="Close">
                                <X
                                    size={ICON.SIZE}
                                    strokeWidth={ICON.STROKE_WIDTH}
                                />
                            </div>
                        </DialogClose>
                    </div>
                </div>

                <MarkingCharacteristicsTable />

                <DialogDescription />
            </DialogContent>
        </DialogPortal>
    );
}

export default MarkingCharacteristicsDialogPortal;
