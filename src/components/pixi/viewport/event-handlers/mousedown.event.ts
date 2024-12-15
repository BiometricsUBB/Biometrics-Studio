import { FederatedPointerEvent } from "pixi.js";
import {
    CURSOR_MODES,
    DashboardToolbarStore,
} from "@/lib/stores/DashboardToolbar";
import { CUSTOM_GLOBAL_EVENTS, MOUSE_BUTTONS } from "@/lib/utils/const";
import { getAngle } from "@/lib/utils/math/getAngle";
import { MARKING_TYPE } from "@/lib/markings/MarkingBase";
import { PointMarking } from "@/lib/markings/PointMarking";
import { RayMarking } from "@/lib/markings/RayMarking";
import {
    ViewportHandlerParams,
    getNormalizedMousePosition,
    addMarkingToStore,
} from "./utils";

type HandlerParams = {
    e: FederatedPointerEvent;
    markingType: MARKING_TYPE;
    interrupt: () => void;
    params: ViewportHandlerParams;
};

let onMouseMove: (e: FederatedPointerEvent) => void = () => {};
let onMouseUp: (e: FederatedPointerEvent) => void = () => {};
let onMouseDown: (e: FederatedPointerEvent) => void = () => {};

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

    onMouseUp = () => {
        viewport.removeEventListener("mousemove", onMouseMove);

        const { temporaryMarking } = markingsStore.state;
        if (temporaryMarking) {
            addMarkingToStore(temporaryMarking, params);

            document.dispatchEvent(
                new Event(CUSTOM_GLOBAL_EVENTS.INTERRUPT_MARKING)
            );
            document.removeEventListener(
                CUSTOM_GLOBAL_EVENTS.INTERRUPT_MARKING,
                interrupt
            );
        }
    };

    viewport.addEventListener("mousemove", onMouseMove);
    viewport.addEventListener("mouseup", onMouseUp, { once: true });
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

    onMouseUp = () => {
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

        onMouseDown = () => {
            viewport.removeEventListener("mousemove", onMouseMove);

            const { temporaryMarking } = markingsStore.state;
            if (temporaryMarking) {
                addMarkingToStore(temporaryMarking, params);

                document.dispatchEvent(
                    new Event(CUSTOM_GLOBAL_EVENTS.INTERRUPT_MARKING)
                );
                document.removeEventListener(
                    CUSTOM_GLOBAL_EVENTS.INTERRUPT_MARKING,
                    interrupt
                );
            }
        };

        viewport.addEventListener("mousemove", onMouseMove);
        viewport.addEventListener("mousedown", onMouseDown, {
            once: true,
        });
    };

    viewport.addEventListener("mousemove", onMouseMove);
    viewport.addEventListener("mouseup", onMouseUp, { once: true });
}

export const handleMouseDown = (
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
        viewport.removeEventListener("mouseup", onMouseUp);
        viewport.removeEventListener("mousedown", onMouseDown);
    };
    document.addEventListener(
        CUSTOM_GLOBAL_EVENTS.INTERRUPT_MARKING,
        interrupt
    );

    if (cursorMode === CURSOR_MODES.MARKING) {
        if ((e.buttons as MOUSE_BUTTONS) !== MOUSE_BUTTONS.PRIMARY) return;

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
            default:
                throw new Error(markingType satisfies never);
        }
    }
};
