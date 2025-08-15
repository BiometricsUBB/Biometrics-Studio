import { ActionProduceCallback } from "../immer.helpers";
import {
    GlobalState as State,
    _useGlobalStateStore as useStore,
} from "./GlobalState.store";

class StoreClass {
    readonly use = useStore;

    get state() {
        return this.use.getState();
    }

    private setPendingMerge(
        callback: ActionProduceCallback<State["pendingMerge"], State>
    ) {
        this.state.set(draft => {
            const updatedValue = callback(draft.pendingMerge, draft);
            // eslint-disable-next-line no-param-reassign
            draft.pendingMerge = updatedValue;
        });
    }

    readonly actions = {
        merge: {
            setPending: (pending: State["pendingMerge"]) => {
                this.setPendingMerge(() => pending);
            },
        },
    };
}

const Store = new StoreClass();
export { Store as GlobalStateStore };
export { StoreClass as GlobalStateStoreClass };
