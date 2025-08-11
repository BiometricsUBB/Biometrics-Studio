/* eslint-disable no-use-before-define */
/* eslint-disable no-param-reassign */

import { produce } from "immer";
import {
    CANVAS_ID,
    CanvasMetadata,
} from "@/components/pixi/canvas/hooks/useCanvasContext";
import { getOppositeCanvasId } from "@/components/pixi/canvas/utils/get-opposite-canvas-id";
import { arrayMax } from "@/lib/utils/array/minmax";
// eslint-disable-next-line import/no-cycle
import { MarkingClass } from "@/lib/markings/MarkingClass";
import { LineSegmentMarking } from "@/lib/markings/LineSegmentMarking";
import { RayMarking } from "@/lib/markings/RayMarking";
import { PointMarking } from "@/lib/markings/PointMarking";
import { BoundingBoxMarking } from "@/lib/markings/BoundingBoxMarking";
import { ActionProduceCallback } from "../immer.helpers";
import {
    _createMarkingsStore as createStore,
    MarkingsState as State,
} from "./Markings.store";
import { GlobalStateStore } from "../GlobalState";
import { IDGenerator } from "./IdGenerator";

const useLeftStore = createStore(CANVAS_ID.LEFT);
const useRightStore = createStore(CANVAS_ID.RIGHT);

class StoreClass {
    readonly id: CANVAS_ID;

    readonly use: typeof useLeftStore;

    private labelGenerator = new IDGenerator();

    constructor(id: CanvasMetadata["id"]) {
        this.id = id;
        this.use = id === CANVAS_ID.LEFT ? useLeftStore : useRightStore;
    }

    get state() {
        return this.use.getState();
    }

    private setMarkingsAndUpdateHash(
        callback: ActionProduceCallback<State["markings"], State>
    ) {
        this.state.set(draft => {
            const newMarkings = callback(draft.markings, draft);
            draft.markings = newMarkings;

            const lastMarking = newMarkings.at(-1);
            if (lastMarking !== undefined)
                GlobalStateStore.actions.lastAddedMarking.setLastAddedMarking({
                    marking: lastMarking,
                    canvasId: this.id,
                });
        });

        this.state.set(draft => {
            draft.markingsHash = crypto.randomUUID();
        });

        const leftHash = Store(CANVAS_ID.LEFT).state.markingsHash;
        const rightHash = Store(CANVAS_ID.RIGHT).state.markingsHash;
        GlobalStateStore.actions.unsavedChanges.checkForUnsavedChanges(
            leftHash,
            rightHash
        );
    }

    private setMarkingsAndUpdateHashWithoutLastAdded(
        callback: ActionProduceCallback<State["markings"], State>
    ) {
        this.state.set(draft => {
            const newMarkings = callback(draft.markings, draft);
            draft.markings = newMarkings;
        });

        this.state.set(draft => {
            draft.markingsHash = crypto.randomUUID();
        });

        const leftHash = Store(CANVAS_ID.LEFT).state.markingsHash;
        const rightHash = Store(CANVAS_ID.RIGHT).state.markingsHash;
        GlobalStateStore.actions.unsavedChanges.checkForUnsavedChanges(
            leftHash,
            rightHash
        );
    }

    private setMarkingsWithoutChangeDetection(
        callback: ActionProduceCallback<State["markings"], State>
    ) {
        this.state.set(draft => {
            const newMarkings = callback(draft.markings, draft);
            draft.markings = newMarkings;

            const lastMarking = newMarkings.at(-1);
            if (lastMarking !== undefined)
                GlobalStateStore.actions.lastAddedMarking.setLastAddedMarking({
                    marking: lastMarking,
                    canvasId: this.id,
                });
        });

        this.state.set(draft => {
            draft.markingsHash = crypto.randomUUID();
        });
    }

    private setTemporaryMarking(
        callback: ActionProduceCallback<State["temporaryMarking"], State>
    ) {
        this.state.set(draft => {
            draft.temporaryMarking = callback(draft.temporaryMarking, draft);
        });
    }

    private setSelectedMarkingLabel(
        callback: ActionProduceCallback<State["selectedMarkingLabel"], State>
    ) {
        this.state.set(draft => {
            draft.selectedMarkingLabel = callback(
                draft.selectedMarkingLabel,
                draft
            );
        });
    }

    readonly actions = {
        labelGenerator: {
            getLabel: () => {
                if (this.state.selectedMarkingLabel) {
                    return this.state.selectedMarkingLabel;
                }

                // Last added marking was added to the opposite canvas and doesnt exist in this canvas yet
                const { lastAddedMarking } = GlobalStateStore.state;
                if (
                    lastAddedMarking &&
                    lastAddedMarking.canvasId !== this.id &&
                    !this.state.markings.some(
                        x => x.label === lastAddedMarking.marking.label
                    )
                ) {
                    this.actions.labelGenerator.reset();
                    return lastAddedMarking.marking.label;
                }

                // Markings collection for this view already contains a marking with the highest generated id
                if (
                    this.state.markings.some(
                        x => x.label === this.labelGenerator.getCurrentId()
                    )
                ) {
                    // Generate id for the marking
                    return this.labelGenerator.generateId();
                }

                // Default safety case
                return this.labelGenerator.getCurrentId();
            },
            getMaxLabel: () => this.labelGenerator.getCurrentId(),
            reset: () => {
                this.labelGenerator = new IDGenerator();

                const oppositeCanvasId = getOppositeCanvasId(this.id);
                const oppositeCanvasLabels = Store(
                    oppositeCanvasId
                ).state.markings.map(m => m.label);
                const thisCanvasLabels = this.state.markings.map(m => m.label);

                const maxLabel =
                    arrayMax([...oppositeCanvasLabels, ...thisCanvasLabels]) ??
                    IDGenerator.initialValue;

                this.labelGenerator.setId(maxLabel);
            },
        },
        markings: {
            reset: () => {
                this.setMarkingsAndUpdateHash(() => []);
            },
            addOne: (marking: MarkingClass) => {
                this.setMarkingsAndUpdateHash(
                    produce(state => {
                        const existingIndex = state.findIndex(
                            m => m.label === marking.label
                        );
                        if (existingIndex !== -1) {
                            state.splice(existingIndex, 1);
                        }
                        state.push(marking);
                    })
                );
                this.setSelectedMarkingLabel(() => null);
            },
            addMany: (markings: MarkingClass[]) =>
                this.setMarkingsAndUpdateHash(
                    produce(state => {
                        state.push(...markings);
                    })
                ),
            removeOneByLabel: (label: MarkingClass["label"]) => {
                if (this.state.selectedMarkingLabel === label) {
                    this.setSelectedMarkingLabel(() => null);
                }

                GlobalStateStore.actions.lastAddedMarking.setLastAddedMarking(
                    null
                );

                this.setMarkingsAndUpdateHashWithoutLastAdded(markings =>
                    markings.filter(marking => marking.label !== label)
                );
            },
            resetForLoading: () => {
                this.setMarkingsWithoutChangeDetection(() => []);
            },
            addManyForLoading: (markings: MarkingClass[]) =>
                this.setMarkingsWithoutChangeDetection(
                    produce(state => {
                        state.push(...markings);
                    })
                ),
        },
        temporaryMarking: {
            setTemporaryMarking: (marking: MarkingClass | null) =>
                this.setTemporaryMarking(produce(() => marking)),
            updateTemporaryMarking: (
                props: Partial<
                    | PointMarking
                    | RayMarking
                    | LineSegmentMarking
                    | BoundingBoxMarking
                >
            ) =>
                this.setTemporaryMarking(
                    produce(marking => {
                        if (marking !== null) {
                            Object.assign(marking, props);
                        }
                    })
                ),
        },
        selectedMarkingLabel: {
            setSelectedMarkingLabel: (label: MarkingClass["label"] | null) =>
                this.setSelectedMarkingLabel(() => label),
        },
    };
}

const LeftStore = new StoreClass(CANVAS_ID.LEFT);
const RightStore = new StoreClass(CANVAS_ID.RIGHT);

export const Store = (id: CanvasMetadata["id"]) => {
    switch (id) {
        case CANVAS_ID.LEFT:
            return LeftStore;
        case CANVAS_ID.RIGHT:
            return RightStore;
        default:
            throw new Error(id satisfies never);
    }
};

export { Store as MarkingsStore };
export { StoreClass as MarkingsStoreClass };
