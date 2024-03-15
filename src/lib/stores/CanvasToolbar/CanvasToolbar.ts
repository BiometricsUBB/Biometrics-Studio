/* eslint-disable no-param-reassign */

import { produce } from "immer";
import { CanvasMetadata } from "@/components/pixi/canvas/hooks/useCanvasContext";
import { ActionProduceCallback } from "../immer.helpers";
import {
    CanvasToolbarState as State,
    _createCanvasToolbarStore as createStore,
} from "./CanvasToolbar.store";

const useLeftStore = createStore("left");
const useRightStore = createStore("right");

class StoreClass {
    readonly use: typeof useLeftStore | typeof useRightStore;

    constructor(id: CanvasMetadata["id"]) {
        this.use = id === "left" ? useLeftStore : useRightStore;
    }

    get state() {
        return this.use.getState();
    }

    private setWithCleanup: typeof this.state.set = callback => {
        this.state.set(callback);
        document.dispatchEvent(new Event("cleanup"));
    };

    private setTextureSetting(
        callback: ActionProduceCallback<State["settings"]["texture"], State>
    ) {
        this.setWithCleanup(draft => {
            draft.settings.texture = callback(draft.settings.texture, draft);
        });
    }

    readonly actions = {
        settings: {
            texture: {
                setScaleMode: (
                    newScaleMode: State["settings"]["texture"]["scaleMode"]
                ) => {
                    this.setTextureSetting(
                        produce(texture => {
                            texture.scaleMode = newScaleMode;
                        })
                    );
                },
            },
        },
    };
}

const LeftStore = new StoreClass("left");
const RightStore = new StoreClass("right");

export const Store = (id: CanvasMetadata["id"]) => {
    switch (id) {
        case "left":
            return LeftStore;
        case "right":
            return RightStore;
        default:
            throw new Error(`Invalid canvas id: ${id}`);
    }
};

export { Store as CanvasToolbarStore };
export { type StoreClass as CanvasToolbarStoreClass };
