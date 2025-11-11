import { CANVAS_ID } from "@/components/pixi/canvas/hooks/useCanvasContext";
import { LineSegmentMarking } from "@/lib/markings/LineSegmentMarking";
import { RotationStore } from "@/lib/stores/Rotation/Rotation";
import {
    DashboardToolbarStore,
    CURSOR_MODES,
} from "@/lib/stores/DashboardToolbar";
import { _createAutoRotateStore as createStore } from "./AutoRotate.store";

const useStore = createStore();

// eslint-disable-next-line no-use-before-define
const autoRotate = (store: StoreClass) => {
    const { getFinishedLines, resetTempLines, resetFinishedLines } =
        store.actions;
    const lines = getFinishedLines();

    const leftLine = lines[CANVAS_ID.LEFT];
    const rightLine = lines[CANVAS_ID.RIGHT];

    if (!leftLine || !rightLine) return;

    const leftAngle = Math.atan2(
        leftLine.endpoint.y - leftLine.origin.y,
        leftLine.endpoint.x - leftLine.origin.x
    );
    const rightAngle = Math.atan2(
        rightLine.endpoint.y - rightLine.origin.y,
        rightLine.endpoint.x - rightLine.origin.x
    );

    const rotationDiff = rightAngle - leftAngle;

    RotationStore(CANVAS_ID.RIGHT).actions.setRotation(rotationDiff);

    resetTempLines();
    resetFinishedLines();
};

class StoreClass {
    readonly use = useStore;

    get state() {
        return this.use.getState();
    }

    readonly actions = {
        setTempLine: (canvasId: CANVAS_ID, line: LineSegmentMarking | null) => {
            this.state.set(draft => {
                // eslint-disable-next-line security/detect-object-injection, no-param-reassign
                draft.tempLines[canvasId] = line;
            });
        },
        setFinishedLine: (
            canvasId: CANVAS_ID,
            line: LineSegmentMarking | null
        ) => {
            this.state.set(draft => {
                // eslint-disable-next-line security/detect-object-injection, no-param-reassign
                draft.finishedLines[canvasId] = line;
            });

            const currentState = this.use.getState();
            if (
                currentState.finishedLines[CANVAS_ID.LEFT] &&
                currentState.finishedLines[CANVAS_ID.RIGHT] &&
                DashboardToolbarStore.state.settings.cursor.mode ===
                    CURSOR_MODES.AUTOROTATE
            ) {
                setTimeout(() => autoRotate(this), 0);
            }
        },
        resetTempLines: () => {
            this.state.set(draft => {
                // eslint-disable-next-line no-param-reassign
                draft.tempLines = {
                    [CANVAS_ID.LEFT]: null,
                    [CANVAS_ID.RIGHT]: null,
                };
            });
        },
        resetFinishedLines: () => {
            this.state.set(draft => {
                // eslint-disable-next-line no-param-reassign
                draft.finishedLines = {
                    [CANVAS_ID.LEFT]: null,
                    [CANVAS_ID.RIGHT]: null,
                };
            });
        },
        getTempLines: () => this.state.tempLines,
        getFinishedLines: () => this.state.finishedLines,
    };
}

const Store = new StoreClass();

export { autoRotate };
export { Store as AutoRotateStore };
export { StoreClass as AutoRotateStoreClass };
