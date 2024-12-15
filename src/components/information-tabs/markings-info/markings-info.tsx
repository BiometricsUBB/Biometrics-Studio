import { MarkingsStore } from "@/lib/stores/Markings";
import {
    CANVAS_ID,
    useCanvasContext,
} from "@/components/pixi/canvas/hooks/useCanvasContext";
import { useEffect, useMemo, useState } from "react";
import { GlobalSettingsStore } from "@/lib/stores/GlobalSettings";
import { getOppositeCanvasId } from "@/components/pixi/canvas/utils/get-opposite-canvas-id";
import { IS_DEV_ENVIRONMENT } from "@/lib/utils/const";
import invariant from "tiny-invariant";
import { hasDuplicates } from "@/lib/utils/array/hasDuplicates";
import { EmptyableMarking, getColumns } from "./columns";
import { DataTable } from "./data-table";

function fillMissingLabels(
    canvasId: CANVAS_ID,
    markings: EmptyableMarking[]
): EmptyableMarking[] {
    const maxLabel =
        MarkingsStore(canvasId).actions.labelGenerator.getMaxLabel();
    if (maxLabel === undefined || maxLabel <= 1) return markings;

    const fullLabels = Array.from({ length: maxLabel }, (_, i) => i + 1);

    const labelSet = new Set(markings.map(marking => marking.label));
    const missingLabels = fullLabels.filter(label => !labelSet.has(label));

    const placeholders = missingLabels.map(
        label =>
            ({
                boundMarkingId: undefined,
                label,
            }) as EmptyableMarking
    );

    return [...markings, ...placeholders].sort((a, b) => a.label - b.label);
}

export function MarkingsInfo({ tableHeight }: { tableHeight: number }) {
    const { id } = useCanvasContext();
    const language = GlobalSettingsStore.use(state => state.settings.language);
    const selectedMarking = MarkingsStore(id).use(
        state => state.selectedMarkingLabel
    );

    const { markings: storeMarkings } = MarkingsStore(id).use(
        state => ({
            markings: state.markings,
            hash: state.markingsHash,
        }),
        (oldState, newState) => {
            // re-rendering tylko wtedy, gdy zmieni się hash stanu
            return oldState.hash === newState.hash;
        }
    );

    const { markings: storeOppositeMarkings } = MarkingsStore(
        getOppositeCanvasId(id)
    ).use(
        state => ({
            markings: state.markings,
            hash: state.markingsHash,
        }),
        (oldState, newState) => {
            // re-rendering tylko wtedy, gdy zmieni się hash stanu
            return oldState.hash === newState.hash;
        }
    );

    useEffect(() => {
        // sprawdzanie, czy znaczniki są unikalne
        if (IS_DEV_ENVIRONMENT) {
            const markingLabels = storeMarkings.map(m => m.label);

            invariant(
                !hasDuplicates(markingLabels),
                "Markings must have unique labels"
            );
        }
    }, [storeMarkings]);

    const [columns, setColumns] = useState(getColumns(id));

    const markings = useMemo(() => {
        const thisIds = storeMarkings.map(m => m.id);
        const thisLabels = storeMarkings.map(m => m.label);
        const combinedMarkings = [
            ...storeMarkings,
            ...storeOppositeMarkings.filter(m => !thisLabels.includes(m.label)),
        ]
            .sort((a, b) => a.label - b.label)
            .map(m =>
                thisIds.includes(m.id)
                    ? m
                    : { boundMarkingId: m.boundMarkingId, label: m.label }
            ) as EmptyableMarking[];

        return fillMissingLabels(id, combinedMarkings);
    }, [storeMarkings, storeOppositeMarkings, id]);

    useEffect(() => {
        setColumns(getColumns(id));
    }, [id, language, selectedMarking]);

    return (
        <div className="w-full h-fit py-0.5">
            <DataTable
                canvasId={id}
                selectedMarking={selectedMarking}
                height={`${tableHeight}px`}
                columns={columns}
                data={markings}
            />
        </div>
    );
}
