import {
    useWorkingModeStore as useStore,
    type State,
} from "./WorkingMode.store";

class StoreClass {
    readonly use = useStore;

    get state() {
        return this.use.getState();
    }

    readonly actions = {
        setWorkingMode: (mode: State["workingMode"]) => {
            this.state.setWorkingMode(mode!);
        },
        resetWorkingMode: () => {
            this.state.resetWorkingMode();
        },
    };
}

const Store = new StoreClass();
export { Store as WorkingModeStore };
export { StoreClass as WorkingModeStoreClass };
