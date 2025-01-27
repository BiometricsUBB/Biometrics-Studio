import { FederatedPointerEvent } from "pixi.js";
import {
    CURSOR_MODES,
    DashboardToolbarStore,
} from "@/lib/stores/DashboardToolbar";
import { CUSTOM_GLOBAL_EVENTS } from "@/lib/utils/const";
import { getAngle } from "@/lib/utils/math/getAngle";
import { MARKING_CLASS } from "@/lib/markings/MarkingBase";
import { PointMarking } from "@/lib/markings/PointMarking";
import { RayMarking } from "@/lib/markings/RayMarking";
import { LineSegmentMarking } from "@/lib/markings/LineSegmentMarking";
import { MarkingCharacteristicsStore } from "@/lib/stores/MarkingCharacteristics/MarkingCharacteristics";
import { WorkingModeStore } from "@/lib/stores/WorkingMode";
import { BoundingBoxMarking } from "@/lib/markings/BoundingBoxMarking";
import { ViewportHandlerParams, getNormalizedMousePosition } from "./utils";

let onMouseMove: (e: FederatedPointerEvent) => void = () => {};
// Right Mouse Button Up
let onRMBUp: (e: FederatedPointerEvent) => void = () => {};
// Right Mouse Button Down
let onRMBDown: (e: FederatedPointerEvent) => void = () => {};

function handlePointMarking(
    e: FederatedPointerEvent,
    interrupt: () => void,
    characteristicId: string,
    params: ViewportHandlerParams
) {
    const { viewport, markingsStore } = params;
    markingsStore.actions.temporaryMarking.setTemporaryMarking(
        new PointMarking(
            markingsStore.actions.labelGenerator.getLabel(),
            getNormalizedMousePosition(e, viewport),
            characteristicId
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

function handleRayMarking(
    e: FederatedPointerEvent,
    interrupt: () => void,
    characteristicId: string,
    params: ViewportHandlerParams
) {
    const { viewport, markingsStore, cachedViewportStore } = params;

    markingsStore.actions.temporaryMarking.setTemporaryMarking(
        new RayMarking(
            markingsStore.actions.labelGenerator.getLabel(),
            getNormalizedMousePosition(e, viewport),
            characteristicId,
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

function handleLineSegmentMarking(
    e: FederatedPointerEvent,
    interrupt: () => void,
    characteristicId: string,
    params: ViewportHandlerParams
) {
    const { viewport, markingsStore, cachedViewportStore } = params;

    markingsStore.actions.temporaryMarking.setTemporaryMarking(
        new LineSegmentMarking(
            markingsStore.actions.labelGenerator.getLabel(),
            getNormalizedMousePosition(e, viewport),
            characteristicId,
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

const handleBoundingBoxMarking = (
    e: FederatedPointerEvent,
    interrupt: () => void,
    characteristicId: string,
    params: ViewportHandlerParams
) => {
    const { viewport, markingsStore, cachedViewportStore } = params;

    markingsStore.actions.temporaryMarking.setTemporaryMarking(
        new BoundingBoxMarking(
            markingsStore.actions.labelGenerator.getLabel(),
            getNormalizedMousePosition(e, viewport),
            characteristicId,
            getNormalizedMousePosition(e, viewport)
        )
    );

    onMouseMove = (e: FederatedPointerEvent) => {
        markingsStore.actions.temporaryMarking.updateTemporaryMarking({
            endpoint: getNormalizedMousePosition(e, viewport),
        });
    };

    onRMBUp = () => {
        viewport.removeEventListener("mousemove", onMouseMove);

        cachedViewportStore.actions.viewport.setRayPosition(
            getNormalizedMousePosition(e, viewport)
        );

        onRMBDown = () => {
            viewport.removeEventListener("mousemove", onMouseMove);

            markingsStore.actions.markings.addOne(
                markingsStore.state.temporaryMarking as BoundingBoxMarking
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
};

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
        const { markingClass } = DashboardToolbarStore.state.settings.marking;
        const workingMode = WorkingModeStore.state.workingMode!;

        const { id: characteristicId } =
            MarkingCharacteristicsStore.actions.activeCharacteristics.getActiveCharacteristicByMarkingClass(
                markingClass,
                workingMode
            );

        switch (markingClass) {
            case MARKING_CLASS.POINT: {
                handlePointMarking(e, interrupt, characteristicId, params);
                break;
            }

            case MARKING_CLASS.RAY: {
                handleRayMarking(e, interrupt, characteristicId, params);
                break;
            }

            case MARKING_CLASS.LINE_SEGMENT: {
                handleLineSegmentMarking(
                    e,
                    interrupt,
                    characteristicId,
                    params
                );
                break;
            }

            case MARKING_CLASS.BOUNDING_BOX: {
                handleBoundingBoxMarking(
                    e,
                    interrupt,
                    characteristicId,
                    params
                );
                break;
            }

            default:
                throw new Error(markingClass satisfies never);
        }
    }
};
