import { i18nObject as Dictionary } from "@/lib/locales/translation";

const d: Dictionary = {
    Marking: {
        Name: "Marking",
        Keys: {
            id: "ID",
            label: "Label",
            angleRad: "Angle",
            backgroundColor: "Background color",
            origin: "Origin",
            endpoint: "Endpoint",
            size: "Size",
            textColor: "Text color",
            type: {
                Name: "Type",
                Keys: {
                    point: "Point",
                    ray: "Ray",
                    line_segment: "Line segment",
                },
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
