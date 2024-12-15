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
import { MarkingBase } from "@/lib/markings/MarkingBase";
import { PointMarking } from "@/lib/markings/PointMarking";
import { RayMarking } from "@/lib/markings/RayMarking";
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

    private setMarkingsHash(
        callback: ActionProduceCallback<State["markingsHash"], State>
    ) {
        this.state.set(draft => {
            draft.markingsHash = callback(draft.markingsHash, draft);
        });
    }

    private setMarkings(
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
    }

    private setMarkingsAndUpdateHash(
        callback: ActionProduceCallback<State["markings"], State>
    ) {
        this.setMarkingsHash(() => crypto.randomUUID());
        this.setMarkings(callback);
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
                // Selected an existing marking, the new marking replaces it with the same label
                if (this.state.selectedMarkingLabel !== null) {
                    return this.state.selectedMarkingLabel;
                }

                // Last added marking was added to the opposite canvas and doesnt exist in this canvas yet
                const { lastAddedMarking } = GlobalStateStore.state;
                if (
                    lastAddedMarking &&
                    lastAddedMarking.canvasId !== this.id &&
                    !this.state.markings.find(
                        x => x.label === lastAddedMarking.marking.label
                    )
                ) {
                    this.actions.labelGenerator.reset();
                    return lastAddedMarking.marking.label;
                }

                // Markings collection for this view already contains a marking with the highest generated id
                if (
                    this.state.markings
                        .map(x => x.label)
                        .includes(this.labelGenerator.getCurrentId())
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
                this.state.markings.forEach(marking => {
                    Store(
                        getOppositeCanvasId(this.id)
                    ).actions.markings.unbindAllWithBoundMarkingId(marking.id);
                });
                this.setMarkingsAndUpdateHash(() => []);
            },
            addOne: (marking: MarkingBase) => {
                if (this.state.markings.find(m => m.label === marking.label)) {
                    this.setMarkingsAndUpdateHash(markings => {
                        return markings.filter(m => m.label !== marking.label);
                    });
                }

                const oppositeCanvasId = getOppositeCanvasId(this.id);
                const oppositeCanvasMarkings =
                    Store(oppositeCanvasId).state.markings;
                const oppositeMarking = oppositeCanvasMarkings.find(
                    m => m.label === marking.label
                );
                if (oppositeMarking) {
                    Store(oppositeCanvasId).actions.markings.bindOneById(
                        oppositeMarking.id,
                        marking.id
                    );
                }

                this.setMarkingsAndUpdateHash(
                    produce(state => {
                        state.push(marking.bind(oppositeMarking?.id));
                    })
                );
                this.setSelectedMarkingLabel(() => null);
                return marking;
            },
            addMany: (markings: MarkingBase[]) => {
                this.setMarkingsAndUpdateHash(
                    produce(state => {
                        state.push(...markings);
                    })
                );
            },
            removeOneByLabel: (label: MarkingBase["label"]) => {
                if (this.state.selectedMarkingLabel === label) {
                    this.setSelectedMarkingLabel(() => null);
                }

                this.actions.markings.unbindOneByLabel(label);

                const oppositeCanvasId = getOppositeCanvasId(this.id);
                Store(oppositeCanvasId).actions.markings.unbindOneByLabel(
                    label
                );

                this.setMarkingsAndUpdateHash(markings => {
                    return markings.filter(marking => marking.label !== label);
                });

                GlobalStateStore.actions.lastAddedMarking.setLastAddedMarking(
                    null
                );
            },
            removeManyById: (ids: string[]) => {
                this.setMarkingsAndUpdateHash(markings =>
                    markings.filter(marking => !ids.includes(marking.id))
                );
            },
            bindOneById: (id: string, boundMarkingId: string) => {
                this.setMarkingsAndUpdateHash(markings =>
                    markings.map(m =>
                        m.id === id ? m.bind(boundMarkingId) : m
                    )
                );
            },
            unbindOneByLabel: (label: MarkingBase["label"]) => {
                this.setMarkingsAndUpdateHash(markings =>
                    markings.map(m =>
                        m.label === label ? m.bind(undefined) : m
                    )
                );
            },
            unbindAllWithBoundMarkingId: (boundMarkingId: string) => {
                this.setMarkingsAndUpdateHash(markings =>
                    markings.map(m =>
                        m.boundMarkingId === boundMarkingId
                            ? m.bind(undefined)
                            : m
                    )
                );
            },
        },
        temporaryMarking: {
            setTemporaryMarking: (marking: MarkingBase | null) =>
                this.setTemporaryMarking(() => marking),
            updateTemporaryMarking: (
                props: Partial<PointMarking | RayMarking>
            ) => {
                this.setTemporaryMarking(
                    produce(state => {
                        if (state !== null) {
                            Object.assign(state, props);
                        }
                    })
                );
            },
        },
        selectedMarkingLabel: {
            setSelectedMarkingLabel: (label: MarkingBase["label"] | null) => {
                this.setSelectedMarkingLabel(() => label);
            },
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
