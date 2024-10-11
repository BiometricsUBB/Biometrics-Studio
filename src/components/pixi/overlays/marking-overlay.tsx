import { Container } from "@pixi/react";
import { useCallback, useMemo } from "react";
import { MarkingsStore } from "@/lib/stores/Markings";
import { ShallowViewportStore } from "@/lib/stores/ShallowViewport";
import { CanvasToolbarStore } from "@/lib/stores/CanvasToolbar";
import { MarkingBase, Position } from "@/lib/markings/MarkingBase";
import { CanvasMetadata } from "../canvas/hooks/useCanvasContext";
import { useGlobalViewport } from "../viewport/hooks/useGlobalViewport";
import { useGlobalApp } from "../app/hooks/useGlobalApp";
import { getViewportPosition } from "./utils/get-viewport-local-position";
import { Markings } from "./markings/markings";

export type MarkingOverlayProps = {
    canvasMetadata: CanvasMetadata;
};

export function MarkingOverlay({ canvasMetadata }: MarkingOverlayProps) {
    const { id } = canvasMetadata;
    const viewport = useGlobalViewport(id, { autoUpdate: true });
    const app = useGlobalApp(id);
    const { markings } = MarkingsStore(id).use(
        state => ({
            markings: state.markings,
            hash: state.markingsHash,
        }),
        (oldState, newState) => {
            // re-rendering tylko wtedy, gdy zmieni się hash stanu
            return oldState.hash === newState.hash;
        }
    );

    const showMarkingLabels = CanvasToolbarStore(id).use(
        state => state.settings.markings.showLabels
    );

    const temporaryMarking = MarkingsStore(id).use(
        state => state.temporaryMarking
    );

    // oblicz proporcje viewportu do świata tylko na evencie zoomed, dla lepszej wydajności (nie ma sensu liczyć tego na każdym renderze
    // bo przy samym ruchu nie zmieniają się proporcje viewportu do świata, tylko przy zoomie)
    const { viewportWidthRatio, viewportHeightRatio } = ShallowViewportStore(
        id
    ).use(
        ({
            size: {
                screenWorldWidth,
                screenWorldHeight,
                worldWidth,
                worldHeight,
            },
        }) => ({
            viewportWidthRatio: screenWorldWidth / worldWidth,
            viewportHeightRatio: screenWorldHeight / worldHeight,
        })
    );

    const getMarkingRelativePosition = useCallback(
        (marking: MarkingBase): Position => {
            return {
                x: marking.origin.x * viewportWidthRatio,
                y: marking.origin.y * viewportHeightRatio,
            };
        },
        [viewportHeightRatio, viewportWidthRatio]
    );

    const relativeMarkings: MarkingBase[] = useMemo(
        () =>
            viewport === null
                ? markings
                : markings.map(marking => ({
                      ...marking,
                      position: getMarkingRelativePosition(marking),
                  })),
        [getMarkingRelativePosition, markings, viewport]
    );

    const relativeTemporaryMarking: MarkingBase | null =
        temporaryMarking === null
            ? null
            : {
                  ...temporaryMarking,
                  origin: getMarkingRelativePosition(temporaryMarking),
              };

    if (viewport === null || app == null) {
        return null;
    }

    return (
        <Container position={getViewportPosition(viewport)}>
            <Markings
                canvasMetadata={canvasMetadata}
                markings={relativeMarkings}
                showMarkingLabels={showMarkingLabels}
            />
            {relativeTemporaryMarking !== null && (
                <Markings
                    canvasMetadata={canvasMetadata}
                    markings={[relativeTemporaryMarking]}
                    showMarkingLabels={showMarkingLabels}
                />
            )}
        </Container>
    );
}
