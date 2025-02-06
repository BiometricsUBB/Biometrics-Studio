import { Container } from "@pixi/react";
import { MarkingsStore } from "@/lib/stores/Markings";
import { CanvasMetadata } from "../canvas/hooks/useCanvasContext";
import { useGlobalViewport } from "../viewport/hooks/useGlobalViewport";
import { useGlobalApp } from "../app/hooks/useGlobalApp";
import { getViewportPosition } from "./utils/get-viewport-local-position";
import { Markings } from "./markings/markings";

export type MarkingOverlayProps = {
    canvasMetadata: CanvasMetadata;
};

export function MarkingOverlay({ canvasMetadata }: MarkingOverlayProps) {
    const { id: canvasId } = canvasMetadata;
    const viewport = useGlobalViewport(canvasId, { autoUpdate: true });
    const app = useGlobalApp(canvasId);

    const { markings } = MarkingsStore(canvasId).use(
        state => ({
            markings: state.markings,
            hash: state.markingsHash,
        }),
        (oldState, newState) => {
            // re-rendering tylko wtedy, gdy zmieni się hash stanu
            return oldState.hash === newState.hash;
        }
    );

    const temporaryMarking = MarkingsStore(canvasId).use(
        state => state.temporaryMarking
    );

    if (viewport === null || app == null) {
        return null;
    }

    return (
        <Container position={getViewportPosition(viewport)}>
            <Markings canvasId={canvasId} markings={markings} />
            {/* If a marking is being created, display it on top of the other markings */}
            {temporaryMarking && (
                <Markings
                    canvasId={canvasId}
                    markings={[temporaryMarking]}
                    alpha={1}
                />
            )}
        </Container>
    );
}
