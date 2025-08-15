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
// Usunięto GlobalStateStore – synchronizacja labeli nie jest już potrzebna
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
                // Jeśli użytkownik ma zaznaczony marking i chce nadpisać – użyj jego labelu.
                if (this.state.selectedMarkingLabel) {
                    return this.state.selectedMarkingLabel;
                }
                // Oblicz globalny maksymalny label po obu canvasach
                const oppositeCanvasId = getOppositeCanvasId(this.id);
                const oppositeCanvasLabels = Store(
                    oppositeCanvasId
                ).state.markings.map(m => m.label);
                const thisCanvasLabels = this.state.markings.map(m => m.label);
                const maxLabelBoth = arrayMax([
                    ...oppositeCanvasLabels,
                    ...thisCanvasLabels,
                ]);
                const target = maxLabelBoth ?? IDGenerator.initialValue; // gdy brak oznaczeń – start od 1

                // Ustaw wewnętrzny generator, aby był zgodny z globalnym stanem
                this.labelGenerator.setId(target);

                // Jeśli „ostatni” label jest wolny po tej stronie – użyj go; w przeciwnym razie nowy (max+1)
                const isTakenHere = this.state.markings.some(
                    x => x.label === target
                );
                return isTakenHere
                    ? this.labelGenerator.generateId()
                    : this.labelGenerator.getCurrentId();
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
                // Wyczyszczenie oznaczeń na tym canvasie
                this.setMarkingsAndUpdateHash(() => []);

                // Jeśli oba canvas-y są puste – zresetuj generatory do 1.
                const oppositeStore = Store(getOppositeCanvasId(this.id));
                const bothEmpty =
                    this.state.markings.length === 0 &&
                    oppositeStore.state.markings.length === 0;

                if (bothEmpty) {
                    this.actions.labelGenerator.reset();
                    oppositeStore.actions.labelGenerator.reset();
                } else {
                    // Utrzymaj generator zsynchronizowany z maksymalnym istniejącym labelem.
                    this.actions.labelGenerator.reset();
                }
            },
            addOne: (marking: MarkingClass) => {
                // Zadbaj o spójność ids po stronie store – jeśli istnieje marking o tym samym labelu
                // (tu lub na przeciwnej stronie), użyj jego stabilnych ids.
                const existingIds = this.actions.markings.findIdsByLabel(
                    marking.label
                );
                const idsToUse =
                    existingIds && existingIds.length > 0
                        ? Array.from(new Set(existingIds))
                        : marking.ids;

                if (this.state.markings.find(m => m.label === marking.label)) {
                    this.setMarkingsAndUpdateHash(markings =>
                        markings.filter(m => m.label !== marking.label)
                    );
                }
                this.setMarkingsAndUpdateHash(
                    produce(state => {
                        // Utwórz nową instancję odpowiadającą klasie markingu zamiast mutować istniejącą (może być zamrożona)
                        let mToPush: MarkingClass = marking;
                        if (marking instanceof PointMarking) {
                            mToPush = new PointMarking(
                                marking.label,
                                marking.origin,
                                marking.typeId,
                                idsToUse
                            );
                        } else if (marking instanceof RayMarking) {
                            mToPush = new RayMarking(
                                marking.label,
                                marking.origin,
                                marking.typeId,
                                (marking as RayMarking).angleRad,
                                idsToUse
                            );
                        } else if (marking instanceof LineSegmentMarking) {
                            mToPush = new LineSegmentMarking(
                                marking.label,
                                marking.origin,
                                marking.typeId,
                                (marking as LineSegmentMarking).endpoint,
                                idsToUse
                            );
                        } else if (marking instanceof BoundingBoxMarking) {
                            mToPush = new BoundingBoxMarking(
                                marking.label,
                                marking.origin,
                                marking.typeId,
                                (marking as BoundingBoxMarking).endpoint,
                                idsToUse
                            );
                        }
                        state.push(mToPush);
                    })
                );
                this.setSelectedMarkingLabel(() => null);
            },
            addMany: (markings: MarkingClass[]) =>
                this.setMarkingsAndUpdateHash(
                    produce(state => {
                        // Przygotuj nowe instancje z właściwymi ids bez mutowania wejściowych obiektów
                        const prepared = markings.map(m => {
                            const existingIds =
                                this.actions.markings.findIdsByLabel(m.label);
                            const idsToUse =
                                existingIds && existingIds.length > 0
                                    ? Array.from(new Set(existingIds))
                                    : m.ids;
                            if (m instanceof PointMarking) {
                                return new PointMarking(
                                    m.label,
                                    m.origin,
                                    m.typeId,
                                    idsToUse
                                );
                            }
                            if (m instanceof RayMarking) {
                                return new RayMarking(
                                    m.label,
                                    m.origin,
                                    m.typeId,
                                    (m as RayMarking).angleRad,
                                    idsToUse
                                );
                            }
                            if (m instanceof LineSegmentMarking) {
                                return new LineSegmentMarking(
                                    m.label,
                                    m.origin,
                                    m.typeId,
                                    (m as LineSegmentMarking).endpoint,
                                    idsToUse
                                );
                            }
                            if (m instanceof BoundingBoxMarking) {
                                return new BoundingBoxMarking(
                                    m.label,
                                    m.origin,
                                    m.typeId,
                                    (m as BoundingBoxMarking).endpoint,
                                    idsToUse
                                );
                            }
                            return m;
                        });
                        state.push(...prepared);
                    })
                ),
            removeOneByLabel: (label: MarkingClass["label"]) => {
                if (this.state.selectedMarkingLabel === label) {
                    this.setSelectedMarkingLabel(() => null);
                }

                // Oblicz nową listę po usunięciu i zastosuj
                const filtered = this.state.markings.filter(
                    marking => marking.label !== label
                );
                this.setMarkingsAndUpdateHash(() => filtered);

                // Jeśli ten label nie istnieje już po obu stronach – skompaktuj etykiety globalnie
                const oppositeStore = Store(getOppositeCanvasId(this.id));
                const existsOpposite = oppositeStore.state.markings.some(
                    m => m.label === label
                );
                if (!existsOpposite) {
                    this.actions.markings.compactLabelsAcrossBoth();
                } else {
                    // Po usunięciu zsynchronizuj generator etykiet.
                    const bothEmpty =
                        filtered.length === 0 &&
                        oppositeStore.state.markings.length === 0;

                    if (bothEmpty) {
                        this.actions.labelGenerator.reset();
                        oppositeStore.actions.labelGenerator.reset();
                    } else {
                        this.actions.labelGenerator.reset();
                    }
                }
            },
            findIdsByLabel: (label: MarkingClass["label"]) => {
                const own = this.state.markings.find(m => m.label === label);
                if (own) return own.ids;
                const opposite = Store(
                    getOppositeCanvasId(this.id)
                ).state.markings.find(m => m.label === label);
                return opposite?.ids;
            },
            mergePair: (
                localLabel: number,
                otherCanvasId: CANVAS_ID,
                otherLabel: number
            ) => {
                const a = this.state.markings.find(m => m.label === localLabel);
                const otherStore = Store(otherCanvasId);
                const b = otherStore.state.markings.find(
                    m => m.label === otherLabel
                );
                if (!a || !b) return;

                const unionIds = Array.from(
                    new Set([...(a.ids ?? []), ...(b.ids ?? [])])
                );

                // Zaktualizuj A (ten store) – zachowuje localLabel i instancję klasy
                this.setMarkingsAndUpdateHash(markings => {
                    const m = markings.find(x => x.label === localLabel);
                    if (m) m.ids = unionIds;
                    return markings;
                });

                // Zaktualizuj B (drugi store) – otrzymuje label lokalny i instancję klasy
                otherStore.setMarkingsAndUpdateHash(markings => {
                    const m = markings.find(x => x.label === otherLabel);
                    if (m) {
                        m.label = localLabel;
                        m.ids = unionIds;
                    }
                    return markings;
                });

                // Po scaleniach – wyczyść zaznaczenie na obu canvasach
                this.setSelectedMarkingLabel(() => null);
                otherStore.actions.selectedMarkingLabel.setSelectedMarkingLabel(
                    null
                );

                // Po scaleniach – skompaktuj globalnie (może powstać dziura po otherLabel)
                this.actions.markings.compactLabelsAcrossBoth();
            },
            compactLabelsAcrossBoth: () => {
                const leftStore = Store(CANVAS_ID.LEFT);
                const rightStore = Store(CANVAS_ID.RIGHT);
                const all = [
                    ...leftStore.state.markings,
                    ...rightStore.state.markings,
                ];
                const uniqueSorted = Array.from(
                    new Set(all.map(m => m.label))
                ).sort((a, b) => a - b);
                const mapping = new Map<number, number>();
                uniqueSorted.forEach((lbl, idx) => mapping.set(lbl, idx + 1));

                const remap = (store: StoreClass) => {
                    store.setMarkingsAndUpdateHash(markings => {
                        markings.forEach(m => {
                            const newLabel = mapping.get(m.label);
                            if (newLabel && newLabel !== m.label)
                                m.label = newLabel;
                        });
                        return markings;
                    });
                    const sel = store.state.selectedMarkingLabel;
                    if (sel) {
                        const newSel = mapping.get(sel) ?? null;
                        store.setSelectedMarkingLabel(() => newSel);
                    }
                    store.actions.labelGenerator.reset();
                };

                remap(leftStore);
                remap(rightStore);
            },
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
