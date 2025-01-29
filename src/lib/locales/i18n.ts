import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { GlobalSettingsStore, LANGUAGES } from "../stores/GlobalSettings";

i18next
    .use(
        resourcesToBackend(
            (language: string, namespace: string) =>
                import(`./${language}/${namespace}.ts`)
        )
    )
    .use(initReactI18next)
    .init({
        defaultNS: [
            "keywords",
            "cursor",
            "object",
            "tooltip",
            "description",
            "dialog",
            "modes",
        ],
        lng: GlobalSettingsStore.state.settings.language,
        fallbackLng: LANGUAGES.ENGLISH,
        load: "languageOnly",
    });

export default i18next;
