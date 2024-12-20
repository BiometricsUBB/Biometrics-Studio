import { FederatedPointerEvent } from "pixi.js";
import {
    CURSOR_MODES,
    DashboardToolbarStore,
} from "@/lib/stores/DashboardToolbar";
import { CUSTOM_GLOBAL_EVENTS } from "@/lib/utils/const";
import { getAngle } from "@/lib/utils/math/getAngle";
import { MARKING_TYPE } from "@/lib/markings/MarkingBase";
import { PointMarking } from "@/lib/markings/PointMarking";
import { RayMarking } from "@/lib/markings/RayMarking";
import { LineSegmentMarking } from "@/lib/markings/LineSegmentMarking";
import { ViewportHandlerParams, getNormalizedMousePosition } from "./utils";

type HandlerParams = {
    e: FederatedPointerEvent;
    markingType: MARKING_TYPE;
    interrupt: () => void;
    params: ViewportHandlerParams;
};

let onMouseMove: (e: FederatedPointerEvent) => void = () => {};
// Right Mouse Button Up
let onRMBUp: (e: FederatedPointerEvent) => void = () => {};
// Right Mouse Button Down
let onRMBDown: (e: FederatedPointerEvent) => void = () => {};

function handlePointMarking({ e, interrupt, params }: HandlerParams) {
    const { viewport, markingsStore } = params;
    const { size, backgroundColor, textColor } =
        DashboardToolbarStore.state.settings.marking;

    markingsStore.actions.temporaryMarking.setTemporaryMarking(
        new PointMarking(
            markingsStore.actions.labelGenerator.getLabel(),
            getNormalizedMousePosition(e, viewport),
            backgroundColor,
            textColor,
            size
        )
    );

    onMouseMove = (e: FederatedPointerEvent) => {
        markingsStore.actions.temporaryMarking.updateTemporaryMarking({
            origin: getNormalizedMousePosition(e, viewport),
        });
    };

    onRMBUp = () => {
        viewport.removeEventListener("mousemove", onMouseMove);

        markingsStore.actions.markings.addOne(
            markingsStore.state.temporaryMarking as PointMarking
        );

        document.dispatchEvent(
            new Event(CUSTOM_GLOBAL_EVENTS.INTERRUPT_MARKING)
        );
        document.removeEventListener(
            CUSTOM_GLOBAL_EVENTS.INTERRUPT_MARKING,
            interrupt
        );
    };

    viewport.addEventListener("mousemove", onMouseMove);
    viewport.addEventListener("rightup", onRMBUp, { once: true });
}

function handleRayMarking({ e, interrupt, params }: HandlerParams) {
    const { viewport, markingsStore, cachedViewportStore } = params;
    const { size, backgroundColor, textColor } =
        DashboardToolbarStore.state.settings.marking;

    markingsStore.actions.temporaryMarking.setTemporaryMarking(
        new RayMarking(
            markingsStore.actions.labelGenerator.getLabel(),
            getNormalizedMousePosition(e, viewport),
            backgroundColor,
            textColor,
            size,
            0
        )
    );

    onMouseMove = (e: FederatedPointerEvent) => {
        markingsStore.actions.temporaryMarking.updateTemporaryMarking({
            origin: getNormalizedMousePosition(e, viewport),
        });
    };

    onRMBUp = () => {
        viewport.removeEventListener("mousemove", onMouseMove);
        cachedViewportStore.actions.viewport.setRayPosition(
            getNormalizedMousePosition(e, viewport)
        );

        onMouseMove = (e: FederatedPointerEvent) => {
            markingsStore.actions.temporaryMarking.updateTemporaryMarking({
                angleRad: getAngle(
                    getNormalizedMousePosition(e, viewport),
                    cachedViewportStore.state.rayPosition
                ),
            });
        };

        onRMBDown = () => {
            viewport.removeEventListener("mousemove", onMouseMove);

            markingsStore.actions.markings.addOne(
                markingsStore.state.temporaryMarking as RayMarking
            );

            document.dispatchEvent(
                new Event(CUSTOM_GLOBAL_EVENTS.INTERRUPT_MARKING)
            );
            document.removeEventListener(
                CUSTOM_GLOBAL_EVENTS.INTERRUPT_MARKING,
                interrupt
            );
        };

        viewport.addEventListener("mousemove", onMouseMove);
        viewport.addEventListener("rightdown", onRMBDown, {
            once: true,
        });
    };

    viewport.addEventListener("mousemove", onMouseMove);
    viewport.addEventListener("rightup", onRMBUp, { once: true });
}

function handleLineSegmentMarking({ e, interrupt, params }: HandlerParams) {
    const { viewport, markingsStore, cachedViewportStore } = params;
    const { size, backgroundColor, textColor } =
        DashboardToolbarStore.state.settings.marking;

    markingsStore.actions.temporaryMarking.setTemporaryMarking(
        new LineSegmentMarking(
            markingsStore.actions.labelGenerator.getLabel(),
            getNormalizedMousePosition(e, viewport),
            backgroundColor,
            textColor,
            size,
            getNormalizedMousePosition(e, viewport)
        )
    );

    onMouseMove = (e: FederatedPointerEvent) => {
        markingsStore.actions.temporaryMarking.updateTemporaryMarking({
            origin: getNormalizedMousePosition(e, viewport),
        });
    };

    onRMBUp = () => {
        viewport.removeEventListener("mousemove", onMouseMove);
        cachedViewportStore.actions.viewport.setRayPosition(
            getNormalizedMousePosition(e, viewport)
        );

        onMouseMove = (e: FederatedPointerEvent) => {
            markingsStore.actions.temporaryMarking.updateTemporaryMarking({
                endpoint: getNormalizedMousePosition(e, viewport),
            });
        };

        onRMBDown = () => {
            viewport.removeEventListener("mousemove", onMouseMove);

            markingsStore.actions.markings.addOne(
                markingsStore.state.temporaryMarking as LineSegmentMarking
            );

            document.dispatchEvent(
                new Event(CUSTOM_GLOBAL_EVENTS.INTERRUPT_MARKING)
            );
            document.removeEventListener(
                CUSTOM_GLOBAL_EVENTS.INTERRUPT_MARKING,
                interrupt
            );
        };

        viewport.addEventListener("mousemove", onMouseMove);
        viewport.addEventListener("rightdown", onRMBDown, {
            once: true,
        });
    };

    viewport.addEventListener("mousemove", onMouseMove);
    viewport.addEventListener("rightup", onRMBUp, { once: true });
}

export const handleRMBDown = (
    e: FederatedPointerEvent,
    params: ViewportHandlerParams
) => {
    const { viewport, markingsStore } = params;

    if (viewport.children.length < 1) return;

    const { mode: cursorMode } = DashboardToolbarStore.state.settings.cursor;

    if (markingsStore.state.temporaryMarking !== null) return;

    const interrupt = () => {
        markingsStore.actions.temporaryMarking.setTemporaryMarking(null);
        viewport.removeEventListener("mousemove", onMouseMove);
        viewport.removeEventListener("rightup", onRMBUp);
        viewport.removeEventListener("rightdown", onRMBDown);
    };
    document.addEventListener(
        CUSTOM_GLOBAL_EVENTS.INTERRUPT_MARKING,
        interrupt
    );

    if (cursorMode === CURSOR_MODES.MARKING) {
        const { type: markingType } =
            DashboardToolbarStore.state.settings.marking;

        const args = { e, params, markingType, interrupt };

        switch (markingType) {
            case MARKING_TYPE.POINT: {
                handlePointMarking(args);
                break;
            }

            case MARKING_TYPE.RAY: {
                handleRayMarking(args);
                break;
            }

            case MARKING_TYPE.LINE_SEGMENT: {
                handleLineSegmentMarking(args);
                break;
            }

            default:
                throw new Error(markingType satisfies never);
        }
    }
};
