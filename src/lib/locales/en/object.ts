import { i18nObject as Dictionary } from "@/lib/locales/translation";

const d: Dictionary = {
    Marking: {
        Name: "Marking",
        Keys: {
            id: "ID",
            label: "Label",
            angleRad: "Angle",
            origin: "Origin",
            endpoint: "Endpoint",
            type: {
                Name: "Type",
                Keys: {
                    point: "Point",
                    ray: "Ray",
                    line_segment: "Line segment",
                },
            },
            characteristicId: "Characteristic ID",
        },
    },
    MarkingCharacteristic: {
        Name: "Marking characteristic",
        Keys: {
            id: "ID",
            name: "Name",
            type: "Characteristic type",
        },
        Style: {
            Name: "Style",
            Keys: {
                backgroundColor: "Background color",
                textColor: "Text color",
                size: "Size",
            },
        },
        Metadata: {
            Name: "Metadata",
            Keys: {
                category: "Category",
            },
        },
    },
    PrerenderingRadius: {
        Name: "Prerendering radius",
        Keys: {
            "very high": "Very high",
            high: "High",
            auto: "Auto (default)",
            low: "Low",
            medium: "Medium",
            none: "None",
        },
    },
    Theme: {
        Name: "Theme",
        Keys: {
            system: "System",
            dark: "Dark",
            light: "Light",
        },
    },
};

export default d;
