import { CellContext, ColumnDef } from "@tanstack/react-table";
import { t } from "i18next";
import { ICON, IS_DEV_ENVIRONMENT } from "@/lib/utils/const";
import { GlobalStateStore } from "@/lib/stores/GlobalState";
import { Link, Trash2 } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { CanvasMetadata } from "@/components/pixi/canvas/hooks/useCanvasContext";
import { getOppositeCanvasId } from "@/components/pixi/canvas/utils/get-opposite-canvas-id";
// eslint-disable-next-line import/no-cycle
import { InternalMarking, MarkingsStore } from "@/lib/stores/Markings";

export type ExtendedMarking = InternalMarking & {
    x: number;
    y: number;
};

export type EmptyBoundMarking = {
    boundMarkingId: NonNullable<InternalMarking["boundMarkingId"]>;
    label: InternalMarking["label"];
};
export type EmptyableMarking = InternalMarking | EmptyBoundMarking;
type EmptyableCellContext = CellContext<EmptyableMarking, unknown>;
type DataCellContext = CellContext<InternalMarking, unknown>;

export function isInternalMarking(
    cell: EmptyableMarking
): cell is InternalMarking {
    return "id" in cell;
}

export function isEmptyBoundMarking(
    cell: EmptyableMarking
): cell is EmptyBoundMarking {
    return !isInternalMarking(cell) && "boundMarkingId" in cell;
}

const formatCell = <T,>(
    context: EmptyableCellContext,
    callback: (context: DataCellContext) => T,
    lastRowEmptyValue: T | string = ""
) => {
    const row = context.row.original;

    if (isInternalMarking(row)) {
        return callback(context as DataCellContext);
    }

    if (isEmptyBoundMarking(row)) {
        if (context.column.id === "boundMarkingId")
            return row.boundMarkingId.slice(0, 8);
        if (context.column.id === "label") return row.label;
    }

    if (lastRowEmptyValue === "") return lastRowEmptyValue;

    const isLastRow = context.row.index + 1 === context.table.getRowCount();
    return isLastRow ? lastRowEmptyValue : "";
};

export const getColumns = (
    id: CanvasMetadata["id"]
): Array<ColumnDef<EmptyableMarking>> => {
    const oppositeId = getOppositeCanvasId(id);
    return [
        {
            id: "actions",
            cell: ({ row: { original: marking } }) => (
                // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                <div
                    className="flex gap-0.5"
                    onClick={e => {
                        e.stopPropagation();
                    }}
                >
                    {isInternalMarking(marking) && marking.id && (
                        <Toggle
                            size="sm-icon"
                            variant="outline"
                            pressed={false}
                            onClickCapture={() => {
                                if (marking.boundMarkingId) {
                                    MarkingsStore(
                                        oppositeId
                                    ).actions.markings.unbindOneById(
                                        marking.boundMarkingId
                                    );
                                }
                                MarkingsStore(
                                    id
                                ).actions.markings.removeOneById(marking.id);
                            }}
                        >
                            <Trash2
                                size={ICON.SIZE}
                                strokeWidth={ICON.STROKE_WIDTH}
                            />
                        </Toggle>
                    )}
                </div>
            ),
        },
        // ID będzie pokazane tylko podczas developmentu
        ...(IS_DEV_ENVIRONMENT
            ? ([
                  {
                      accessorKey: "id",
                      header: t("Marking.Keys.id", { ns: "object" }),
                      cell: cell =>
                          formatCell(
                              cell,
                              ({ row }) =>
                                  row.original.id.slice(0, 8) +
                                  (isInternalMarking(row.original) &&
                                  GlobalStateStore.state.lastAddedMarking
                                      ?.id === row.original.id
                                      ? " (last) "
                                      : "")
                          ),
                  },
              ] as Array<ColumnDef<EmptyableMarking>>)
            : []),
        // ID będzie pokazane tylko podczas developmentu
        ...(IS_DEV_ENVIRONMENT
            ? ([
                  {
                      accessorKey: "size",
                      header: "Size",
                      cell: cell =>
                          formatCell(cell, ({ row }) => row.original.size),
                  },
              ] as Array<ColumnDef<EmptyableMarking>>)
            : []),
        {
            accessorKey: "label",
            header: t("Marking.Keys.label", { ns: "object" }),
            cell: cell =>
                formatCell(cell, ({ row: { original: marking } }) => (
                    <div className="flex flex-row gap-1">
                        <div>{marking.label}</div>
                        <div className="size-5 inline-flex items-center justify-center">
                            {isInternalMarking(marking) &&
                                marking.boundMarkingId && (
                                    <Link
                                        size={ICON.SIZE}
                                        strokeWidth={ICON.STROKE_WIDTH}
                                    />
                                )}
                        </div>
                    </div>
                )),
        },
        // Powiązane ID będzie pokazane tylko podczas developmentu
        ...(IS_DEV_ENVIRONMENT
            ? ([
                  {
                      accessorKey: "boundMarkingId",
                      header: t("Marking.Keys.boundMarkingId", {
                          ns: "object",
                      }),
                      cell: cell =>
                          formatCell(cell, ({ row }) =>
                              row.original.boundMarkingId?.slice(0, 8)
                          ),
                  },
              ] as Array<ColumnDef<EmptyableMarking>>)
            : []),
        {
            accessorKey: "type",
            header: t("Marking.Keys.type.Name", { ns: "object" }),
            cell: cell =>
                formatCell(cell, ({ row }) => {
                    const marking = row.original;

                    return t(`Marking.Keys.type.Keys.${marking.type}`, {
                        ns: "object",
                    });
                }),
        },
    ];
};
