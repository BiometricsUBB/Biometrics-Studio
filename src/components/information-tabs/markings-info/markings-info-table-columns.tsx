import { CellContext, ColumnDef } from "@tanstack/react-table";
import { ICON } from "@/lib/utils/const";
import { Trash2, Link2 } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { CanvasMetadata } from "@/components/pixi/canvas/hooks/useCanvasContext";
import { MarkingsStore } from "@/lib/stores/Markings";
import { MarkingClass } from "@/lib/markings/MarkingClass";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { MarkingTypesStore } from "@/lib/stores/MarkingTypes/MarkingTypes";
import { getOppositeCanvasId } from "@/components/pixi/canvas/utils/get-opposite-canvas-id";
import { GlobalStateStore } from "@/lib/stores/GlobalState";
/* eslint-disable sonarjs/no-duplicated-branches */
export type EmptyMarking = {
    label: MarkingClass["label"];
};
export type EmptyableMarking = MarkingClass | EmptyMarking;
type EmptyableCellContext = CellContext<EmptyableMarking, unknown>;
type DataCellContext = CellContext<MarkingClass, unknown>;

export function isMarkingBase(cell: EmptyableMarking): cell is MarkingClass {
    return "ids" in cell;
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
                        const oppositeId = getOppositeCanvasId(id);
                        const oppositeMarkings =
                            MarkingsStore(oppositeId).state.markings;
                        const hasCounterpart =
                            isMarkingBase(marking) &&
                            oppositeMarkings.some(om =>
                                om.ids.some(idv =>
                                    (marking as MarkingClass).ids.includes(idv)
                                )
                            );
                        const pending = GlobalStateStore.state.pendingMerge;
                        const isPendingHere =
                            isMarkingBase(marking) &&
                            pending &&
                            pending.canvasId === id &&
                            pending.label === marking.label;
                        /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
                        return (
                            /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
                            <div
                                className="flex gap-0.5"
                                onClick={e => {
                                    e.stopPropagation();
                                }}
                            >
                                {isMarkingBase(marking) && (
                                    <>
                                        <Toggle
                                            title="Remove"
                                            size="sm-icon"
                                            variant="outline"
                                            pressed={false}
                                            onClickCapture={() => {
                                                MarkingsStore(
                                                    id
                                                ).actions.markings.removeOneByLabel(
                                                    (marking as MarkingClass)
                                                        .label
                                                );
                                            }}
                                        >
                                            <Trash2
                                                size={ICON.SIZE}
                                                strokeWidth={ICON.STROKE_WIDTH}
                                            />
                                        </Toggle>
                                        <Toggle
                                            title="Merge"
                                            size="sm-icon"
                                            variant="outline"
                                            pressed={!!isPendingHere}
                                            disabled={hasCounterpart}
                                            onClickCapture={() => {
                                                const current = {
                                                    canvasId: id,
                                                    label: (
                                                        marking as MarkingClass
                                                    ).label,
                                                };
                                                const pendingSel =
                                                    GlobalStateStore.state
                                                        .pendingMerge;
                                                if (!pendingSel) {
                                                    GlobalStateStore.actions.merge.setPending(
                                                        current
                                                    );
                                                } else if (
                                                    pendingSel.canvasId !== id
                                                ) {
                                                    MarkingsStore(
                                                        pendingSel.canvasId
                                                    ).actions.markings.mergePair(
                                                        pendingSel.label,
                                                        id,
                                                        (
                                                            marking as MarkingClass
                                                        ).label
                                                    );
                                                    GlobalStateStore.actions.merge.setPending(
                                                        null
                                                    );
                                                } else {
                                                    GlobalStateStore.actions.merge.setPending(
                                                        current
                                                    );
                                                }
                                            }}
                                        >
                                            <Link2
                                                size={ICON.SIZE}
                                                strokeWidth={ICON.STROKE_WIDTH}
                                            />
                                        </Toggle>
                                    </>
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
                    accessorKey: "type",
                    header: t("MarkingType.Keys.name", { ns: "object" }),
                    cell: info =>
                        formatCell(info, ({ row }) => {
                            const marking = row.original.typeId;
                            return `${MarkingTypesStore.use().types.find(e => e.id === marking)?.displayName}`;
                        }),
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
