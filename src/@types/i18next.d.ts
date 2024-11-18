import {
    i18nKeywords,
    i18nCursor,
    i18nObject,
    i18nTooltip,
    i18nDescription,
    i18nDialog,
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
        ];
        resources: {
            keywords: i18nKeywords;
            cursor: i18nCursor;
            object: i18nObject;
            tooltip: i18nTooltip;
            description: i18nDescription;
            dialog: i18nDialog;
        };
    }
}
