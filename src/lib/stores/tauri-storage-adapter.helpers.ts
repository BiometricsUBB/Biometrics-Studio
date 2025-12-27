import { LazyStore } from "@tauri-apps/plugin-store";
import { StateStorage } from "zustand/middleware";

export function tauriStorage(store: LazyStore): StateStorage {
    return {
        async removeItem(key: string): Promise<void> {
            await store.delete(key);
            await store.save();
        },
        async getItem(key: string): Promise<string | null> {
            const value = await store.get<string>(key);
            return value ?? null;
        },
        async setItem(key: string, value: string) {
            await store.set(key, value);
            await store.save();
        },
    };
}
