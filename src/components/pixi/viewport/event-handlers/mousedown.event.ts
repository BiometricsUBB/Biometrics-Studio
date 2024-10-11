import { FederatedPointerEvent } from "pixi.js";
import {
    CURSOR_MODES,
    DashboardToolbarStore,
} from "@/lib/stores/DashboardToolbar";
import { CUSTOM_GLOBAL_EVENTS, MOUSE_BUTTONS } from "@/lib/utils/const";
import { getAngle } from "@/lib/utils/math/getAngle";
import { isMarkingBase } from "@/components/information-tabs/markings-info/columns";
import { MARKING_TYPE, MarkingBase } from "@/lib/markings/MarkingBase";
import {
    ViewportHandlerParams,
    addOrEditMarking,
    createMarking,
    getNormalizedMousePosition,
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

function setTemporaryMarkingToEitherNewOrExisting(
    newMarking: MarkingBase | null,
    params: ViewportHandlerParams
) {
    const { markingsStore } = params;
    const { selectedMarking } = markingsStore.state;
    const { editOneById: editMarkingById } = markingsStore.actions.markings;
    const { setTemporaryMarking } = markingsStore.actions.temporaryMarking;

    const isInternal = selectedMarking && isMarkingBase(selectedMarking);

    if (isInternal) {
        const { size, backgroundColor, textColor } =
            DashboardToolbarStore.state.settings.marking;

        editMarkingById(selectedMarking.id, {
            size,
            backgroundColor,
            textColor,
            hidden: true,
        });
    }

    setTemporaryMarking(
        newMarking,
        isInternal ? selectedMarking.label : undefined,
        isInternal ? selectedMarking.id : undefined
    );
}

function handlePointMarking({
    e,
    markingType,
    interrupt,
    params,
}: HandlerParams) {
    const { viewport, markingsStore } = params;
    const { updateTemporaryMarking } = markingsStore.actions.temporaryMarking;

    setTemporaryMarkingToEitherNewOrExisting(
        createMarking(
            markingType,
            null,
            getNormalizedMousePosition(e, viewport)
        ),
        params
    );

    onMouseMove = (e: FederatedPointerEvent) => {
        updateTemporaryMarking({
            origin: getNormalizedMousePosition(e, viewport),
        });
    };

    onMouseUp = () => {
        viewport.removeEventListener("mousemove", onMouseMove);

        const { temporaryMarking } = markingsStore.state;
        if (temporaryMarking) {
            addOrEditMarking(temporaryMarking, params);

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

function handleRayMarking({
    e,
    markingType,
    interrupt,
    params,
}: HandlerParams) {
    const { viewport, markingsStore, cachedViewportStore } = params;
    const { updateTemporaryMarking } = markingsStore.actions.temporaryMarking;

    setTemporaryMarkingToEitherNewOrExisting(
        createMarking(markingType, 0, getNormalizedMousePosition(e, viewport)),
        params
    );

    onMouseMove = (e: FederatedPointerEvent) => {
        updateTemporaryMarking({
            origin: getNormalizedMousePosition(e, viewport),
        });
    };

    onMouseUp = () => {
        viewport.removeEventListener("mousemove", onMouseMove);

        const { setRayPosition } = cachedViewportStore.actions.viewport;
        const mousePos = getNormalizedMousePosition(e, viewport);
        setRayPosition(mousePos);

        onMouseMove = (e: FederatedPointerEvent) => {
            const mousePos = getNormalizedMousePosition(e, viewport);
            const { rayPosition } = cachedViewportStore.state;
            updateTemporaryMarking({
                angleRad: getAngle(mousePos, rayPosition),
            });
        };

        onMouseDown = () => {
            viewport.removeEventListener("mousemove", onMouseMove);

            const { temporaryMarking } = markingsStore.state;
            if (temporaryMarking) {
                addOrEditMarking(temporaryMarking, params);

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

    const { setTemporaryMarking } = markingsStore.actions.temporaryMarking;

    const { temporaryMarking } = markingsStore.state;
    if (temporaryMarking !== null) return;

    const interrupt = () => {
        const { temporaryMarking } = markingsStore.state;
        if (temporaryMarking && temporaryMarking.label !== -1) {
            const marking = markingsStore.state.markings.find(
                m => m.label === temporaryMarking.label
            );
            if (marking) {
                markingsStore.actions.markings.editOneById(marking.id, {
                    hidden: false,
                });
            }
        }

        setTemporaryMarking(null);
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
