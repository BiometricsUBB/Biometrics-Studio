import {
    i18nKeywords,
    i18nCursor,
    i18nObject,
    i18nTooltip,
    i18nDialog,
    i18nModes,
} from "@/lib/locales/translation";

declare module "i18next" {
    interface CustomTypeOptions {
        defaultNS: [
            "keywords",
            "cursor",
            "object",
            "tooltip",
            "description",
            "dialog",
            "modes",
        ];
        resources: {
            keywords: i18nKeywords;
            cursor: i18nCursor;
            object: i18nObject;
            tooltip: i18nTooltip;
            dialog: i18nDialog;
            modes: i18nModes;
        };
    }
}
