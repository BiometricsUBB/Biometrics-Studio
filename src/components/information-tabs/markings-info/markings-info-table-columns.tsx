import { CellContext, ColumnDef } from "@tanstack/react-table";
import { ICON } from "@/lib/utils/const";
import { Trash2 } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { CanvasMetadata } from "@/components/pixi/canvas/hooks/useCanvasContext";
import { MarkingsStore } from "@/lib/stores/Markings";
import { MarkingBase } from "@/lib/markings/MarkingBase";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";

export type EmptyMarking = {
    label: MarkingBase["label"];
};
export type EmptyableMarking = MarkingBase | EmptyMarking;
type EmptyableCellContext = CellContext<EmptyableMarking, unknown>;
type DataCellContext = CellContext<MarkingBase, unknown>;

export function isMarkingBase(cell: EmptyableMarking): cell is MarkingBase {
    return "id" in cell;
}

const formatCell = <T,>(
    context: EmptyableCellContext,
    callback: (context: DataCellContext) => T,
    lastRowEmptyValue: T | string = ""
) => {
    const row = context.row.original;

    if (isMarkingBase(row)) {
        return callback(context as DataCellContext);
    }

    if (context.column.id === "label") return row.label;

    if (lastRowEmptyValue === "") return lastRowEmptyValue;

    const isLastRow = context.row.index + 1 === context.table.getRowCount();
    return isLastRow ? lastRowEmptyValue : "";
};

export const useColumns = (
    id: CanvasMetadata["id"]
): ColumnDef<EmptyableMarking, Element>[] => {
    const { t } = useTranslation();

    return useMemo(
        () =>
            [
                {
                    id: "actions",
                    cell: ({ row }) => {
                        const marking = row.original;
                        return (
                            // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
                            <div
                                className="flex gap-0.5"
                                onClick={e => {
                                    e.stopPropagation();
                                }}
                            >
                                {isMarkingBase(marking) && marking.id && (
                                    <Toggle
                                        title="Remove"
                                        size="sm-icon"
                                        variant="outline"
                                        pressed={false}
                                        onClickCapture={() => {
                                            MarkingsStore(
                                                id
                                            ).actions.markings.removeOneByLabel(
                                                marking.label
                                            );
                                        }}
                                    >
                                        <Trash2
                                            size={ICON.SIZE}
                                            strokeWidth={ICON.STROKE_WIDTH}
                                        />
                                    </Toggle>
                                )}
                            </div>
                        );
                    },
                },
                {
                    accessorKey: "label",
                    header: t("Marking.Keys.label", { ns: "object" }),
                    cell: info =>
                        formatCell(info, ({ row: { original: marking } }) => (
                            <div className="flex flex-row gap-1">
                                <div>{marking.label}</div>
                            </div>
                        )),
                },
                {
                    accessorKey: "markingClass",
                    header: t("Marking.Keys.markingClass.Name", {
                        ns: "object",
                    }),
                    cell: info =>
                        formatCell(info, ({ row }) => {
                            const marking = row.original;
                            return t(
                                `Marking.Keys.markingClass.Keys.${marking.markingClass}`,
                                {
                                    ns: "object",
                                }
                            );
                        }),
                },
            ] as ColumnDef<EmptyableMarking, Element>[],
        [t, id]
    );
};
