import { produce } from "immer";

export type ProduceCallback<T> = (callback: (draft: T) => void) => void;
export const produceCallback = <T>(callback: (draft: T) => void) =>
    produce(state => {
        callback(state);
    });

export type Immer<T> = T & {
    set: ProduceCallback<T>;
    reset: () => void;
};
export type ActionProduceCallback<S, T> = (prop: S, draft: T) => S;
