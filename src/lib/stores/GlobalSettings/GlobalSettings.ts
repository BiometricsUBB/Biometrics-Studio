/* eslint-disable security/detect-object-injection */
/* eslint-disable no-param-reassign */

import { produce } from "immer";
import { ActionProduceCallback } from "../immer.helpers";
import {
    GlobalSettingsState as State,
    _useGlobalSettingsStore as useStore,
} from "./GlobalSettings.store";

class StoreClass {
    readonly use = useStore;

    get state() {
        return this.use.getState();
    }

    private setLanguageSettings(
        callback: ActionProduceCallback<State["settings"]["language"], State>
    ) {
        this.state.set(draft => {
            draft.settings.language = callback(draft.settings.language, draft);
        });
    }

    private setInterfaceSettings(
        callback: ActionProduceCallback<State["settings"]["interface"], State>
    ) {
        this.state.set(draft => {
            draft.settings.interface = callback(
                draft.settings.interface,
                draft
            );
        });
    }

    private setVideoSettings(
        callback: ActionProduceCallback<State["settings"]["video"], State>
    ) {
        this.state.set(draft => {
            draft.settings.video = callback(draft.settings.video, draft);
        });
    }

    readonly actions = {
        settings: {
            language: {
                /** Ta funkcja zmienia stan języka TYLKO w store
                 *
                 * Żeby zmienić język aplikacji użyj useTranslation().i18n.changeLanguage
                 * */
                setLanguage: (newLanguage: State["settings"]["language"]) => {
                    this.setLanguageSettings(() => newLanguage);
                },
            },
            interface: {
                /** Ta funkcja zmienia theme TYLKO w store
                 *
                 * Żeby zmienić theme aplikacji użyj useTheme().setTheme
                 * */
                setTheme: (
                    newTheme: State["settings"]["interface"]["theme"]
                ) => {
                    this.setInterfaceSettings(
                        produce(settings => {
                            settings.theme = newTheme;
                        })
                    );
                },
            },
            video: {
                setPrerenderRadius: (
                    newRadius: State["settings"]["video"]["rendering"]["prerenderRadius"]
                ) => {
                    this.setVideoSettings(
                        produce(settings => {
                            settings.rendering.prerenderRadius = newRadius;
                        })
                    );
                },
            },
        },
    };
}

const Store = new StoreClass();
export { Store as GlobalSettingsStore };
export { StoreClass as GlobalSettingsStoreClass };
