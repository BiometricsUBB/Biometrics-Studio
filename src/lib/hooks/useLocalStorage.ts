import { useCallback, useEffect, useSyncExternalStore } from "react";

function dispatchStorageEvent(key: string, newValue: string | null) {
    window.dispatchEvent(
        new StorageEvent("storage", {
            key,
            newValue,
        })
    );
}

// Set item in localStorage and trigger a storage event
const setLocalStorageItem = <T>(key: string, value: T): void => {
    const stringifiedValue = JSON.stringify(value);
    window.localStorage.setItem(key, stringifiedValue);
    dispatchStorageEvent(key, stringifiedValue);
};

// Remove item from localStorage and trigger a storage event
const removeLocalStorageItem = (key: string): void => {
    window.localStorage.removeItem(key);
    dispatchStorageEvent(key, null);
};

// Get item from localStorage
const getLocalStorageItem = (key: string): string | null => {
    return window.localStorage.getItem(key);
};

// Subscribe to localStorage events
const useLocalStorageSubscribe = (
    callback: (event: StorageEvent) => void
): (() => void) => {
    window.addEventListener("storage", callback);
    return () => window.removeEventListener("storage", callback);
};

export function useLocalStorage<T>(key: string, initialValue?: T) {
    const getSnapshot = () => getLocalStorageItem(key);

    const store = useSyncExternalStore(useLocalStorageSubscribe, getSnapshot);

    const setState = useCallback(
        (value: T | ((prevValue: T) => T)) => {
            try {
                const nextState =
                    typeof value === "function"
                        ? (value as (prevValue: T) => T)(
                              JSON.parse(store ?? "null") as T
                          )
                        : value;

                if (nextState === undefined || nextState === null) {
                    removeLocalStorageItem(key);
                } else {
                    setLocalStorageItem(key, nextState);
                }
            } catch {
                // Do nothing
            }
        },
        [key, store]
    );

    useEffect(() => {
        if (
            getLocalStorageItem(key) === null &&
            typeof initialValue !== "undefined"
        ) {
            setLocalStorageItem(key, initialValue);
        }
    }, [key, initialValue]);

    return [store ? JSON.parse(store) : initialValue, setState];
}
