import { Container } from "@pixi/react";
import { Grid } from "../app/debug/grid";
import { CanvasMetadata } from "../canvas/hooks/useCanvasContext";
import { useGlobalViewport } from "../viewport/hooks/useGlobalViewport";
import { useGlobalApp } from "../app/hooks/useGlobalApp";

export type DebugOverlayProps = {
    canvasMetadata: CanvasMetadata;
};
export function CenterMarkOverlay({
    canvasMetadata: { id },
}: DebugOverlayProps) {
    const viewport = useGlobalViewport(id, { autoUpdate: true });
    const app = useGlobalApp(id);

    if (!viewport || !app) {
        return null;
    }

    return (
        <Container position={{ x: 0, y: 0 }}>
            <Grid
                width={viewport.screenWidth}
                height={viewport.screenHeight}
                color="hsla(0, 50%, 50%, .5)"
                gridLinesCount={2}
                gridLinesWidth={2}
            />
        </Container>
    );
}
