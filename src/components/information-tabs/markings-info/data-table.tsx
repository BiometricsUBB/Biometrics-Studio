/* eslint-disable func-names */
/* eslint-disable security/detect-object-injection */
/* eslint-disable jsx-a11y/click-events-have-key-events */

"use client";

import {
    ColumnDef,
    Row,
    SortDirection,
    SortingState,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";

import {
    HTMLAttributes,
    forwardRef,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import { TableVirtuoso, TableVirtuosoHandle } from "react-virtuoso";
import { cn } from "@/lib/utils/shadcn";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { MarkingsState, MarkingsStore } from "@/lib/stores/Markings";
import { CANVAS_ID } from "@/components/pixi/canvas/hooks/useCanvasContext";
import { CUSTOM_GLOBAL_EVENTS } from "@/lib/utils/const";
import { triggerPostMoveFlash } from "@atlaskit/pragmatic-drag-and-drop-flourish/trigger-post-move-flash";
import { sleep } from "@/lib/utils/misc/sleep";
import { GlobalStateStore } from "@/lib/stores/GlobalState";
import {
    EmptyableMarking,
    isEmptyBoundMarking,
    isInternalMarking,
} from "./columns";

// Original Table is wrapped with a <div> (see https://ui.shadcn.com/docs/components/table#radix-:r24:-content-manual),
// but here we don't want it, so let's use a new component with only <table> tag
const TableComponent = forwardRef<
    HTMLTableElement,
    HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
    <table
        ref={ref}
        className={cn("w-full caption-bottom text-sm bg-card/10", className)}
        {...props}
    />
));
TableComponent.displayName = "TableComponent";

let hasFlashed = false;

const TableRowComponent = <TData,>(rows: Row<TData>[], canvasId: CANVAS_ID) => {
    return function useTableRow(props: HTMLAttributes<HTMLTableRowElement>) {
        // @ts-expect-error data-index is a valid attribute
        const index = props["data-index"];
        const row = rows[index];
        const ref = useRef(null);

        const runAnimation = useCallback(() => {
            sleep(0).then(() => {
                const element = ref.current;
                if (!element) {
                    return;
                }
                triggerPostMoveFlash(element);
                hasFlashed = true;
            });
        }, []);

        if (!row) return null;

        const marking = row.original as EmptyableMarking;
        const { selectedMarking } = MarkingsStore(canvasId).state;
        const selected = isInternalMarking(marking)
            ? selectedMarking === marking
            : false;
        const cells = row.getVisibleCells();

        const isSelected =
            selectedMarking &&
            selectedMarking.label === marking.label &&
            selectedMarking.boundMarkingId === marking.boundMarkingId &&
            (isInternalMarking(selectedMarking) && isInternalMarking(marking)
                ? selectedMarking.id === marking.id
                : true);

        const { lastAddedMarking } = GlobalStateStore.state;
        const isLastAdded =
            lastAddedMarking &&
            lastAddedMarking.canvasId === canvasId &&
            lastAddedMarking.label === marking.label;

        if (isLastAdded && !hasFlashed) {
            runAnimation();
        }

        return (
            <TableRow
                ref={ref}
                key={row.id}
                className={cn("last:border-b-0 cursor-pointer", {
                    "hover:bg-accent/45 bg-accent/75": isSelected,
                    "text-foreground/60": isEmptyBoundMarking(marking),
                })}
                data-state={selected && "selected"}
                onClick={e => {
                    e.stopPropagation();
                    if (selectedMarking?.label === marking.label) {
                        // odznacz
                        MarkingsStore(
                            canvasId
                        ).actions.selectedMarking.setSelectedMarking(null);
                        document.dispatchEvent(
                            new Event(CUSTOM_GLOBAL_EVENTS.CLEANUP)
                        );
                    } else {
                        // zaznacz
                        MarkingsStore(
                            canvasId
                        ).actions.selectedMarking.setSelectedMarking(marking);
                    }
                }}
                {...props}
            >
                {cells.map(cell => (
                    <TableCell key={cell.id}>
                        {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                        )}
                    </TableCell>
                ))}
            </TableRow>
        );
    };
};

function SortingIndicator({ isSorted }: { isSorted: SortDirection | false }) {
    if (!isSorted) return null;
    return (
        <div className="relative w-0 right-0">
            {
                {
                    asc: "↑",
                    desc: "↓",
                }[isSorted]
            }
        </div>
    );
}

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    selectedMarking: MarkingsState["selectedMarking"];
    data: TData[];
    height: string;
    canvasId: CANVAS_ID;
}

let prevDataLength = 0;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DataTable = function <TData, TValue>({
    columns,
    selectedMarking,
    data,
    height,
    canvasId,
}: DataTableProps<TData, TValue>) {
    const ref = useRef<TableVirtuosoHandle>(null);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [rowSelection, setRowSelection] = useState({});
    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            rowSelection,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onRowSelectionChange: setRowSelection,
    });

    const { rows } = table.getRowModel();

    useEffect(() => {
        const virtuoso = ref.current;
        if (virtuoso === null) return;

        const getIndex = () => {
            if (selectedMarking === null) {
                if (prevDataLength === data.length) return -1;
                return rows.findIndex(row => row.original === data.at(-1));
            }

            return rows.findIndex(row => row.original === selectedMarking);
        };

        const index = getIndex();
        if (index === -1) return;

        sleep(0).then(() => {
            virtuoso.scrollToIndex({
                index,
                align: "center",
                behavior: "auto",
            });
        });
    }, [selectedMarking, data, rows]);

    useEffect(() => {
        if (data.length > prevDataLength) {
            hasFlashed = false;
        }
        prevDataLength = data.length;
    }, [data.length]);

    return (
        <TableVirtuoso
            ref={ref}
            followOutput
            style={{
                height,
                scrollbarGutter: "stable both-edges",
            }}
            totalCount={rows.length}
            components={{
                Table: TableComponent,
                TableRow: TableRowComponent(rows, canvasId),
            }}
            fixedHeaderContent={() =>
                table.getHeaderGroups().map(headerGroup => (
                    <TableRow
                        className={cn("bg-card hover:bg-muted border-b-0")}
                        key={headerGroup.id}
                    >
                        {headerGroup.headers.map(header => {
                            return (
                                <TableHead
                                    key={header.id}
                                    colSpan={header.colSpan}
                                    style={{
                                        width: header.getSize(),
                                    }}
                                >
                                    {header.isPlaceholder ? null : (
                                        <div
                                            className="flex items-center"
                                            role="button"
                                            tabIndex={0}
                                            onClick={header.column.getToggleSortingHandler()}
                                            style={
                                                header.column.getCanSort()
                                                    ? {
                                                          cursor: "pointer",
                                                          userSelect: "none",
                                                      }
                                                    : undefined
                                            }
                                        >
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                            <SortingIndicator
                                                isSorted={header.column.getIsSorted()}
                                            />
                                        </div>
                                    )}
                                </TableHead>
                            );
                        })}
                    </TableRow>
                ))
            }
        />
    );
};
