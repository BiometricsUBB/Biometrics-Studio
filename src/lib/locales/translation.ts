import { MARKING_TYPE } from "@/lib/markings/MarkingBase";
import { RayMarking } from "@/lib/markings/RayMarking";
import { PointMarking } from "@/lib/markings/PointMarking";
import { PRERENDER_RADIUS_OPTIONS, THEMES } from "../stores/GlobalSettings";

type Recordify<T> = { [K in Extract<T, string> as `${K}`]: string };

export type i18nKeywords = Recordify<
    | "Homepage"
    | "Settings"
    | "Interface"
    | "Video"
    | "Language"
    | "Markings"
    | "Debug"
    | "Theme"
    | "Rendering"
    | "Prerendering radius"
    | "Dark mode"
    | "On"
    | "Off"
>;

export type i18nCursor = {
    Mode: Recordify<"Selection" | "Marking">;
};

export type i18nObject = {
    Marking: {
        Name: string;
        Keys: Omit<
            Recordify<keyof RayMarking | keyof PointMarking>,
            "type" | "isVisible" | "getRelativeOrigin" | "bind"
        > & {
            type: {
                Name: string;
                Keys: Recordify<MARKING_TYPE>;
            };
        };
    };
    PrerenderingRadius: {
        Name: string;
        Keys: Recordify<PRERENDER_RADIUS_OPTIONS>;
    };
    Theme: {
        Name: string;
        Keys: Recordify<THEMES>;
    };
};

export type i18nTooltip = Recordify<
    | "Lock viewports"
    | "Synchronize viewports with scale"
    | "Save markings data to a JSON file"
    | "Load markings data from file"
    | "Load forensic mark image"
    | "Fit world"
    | "Fit height"
    | "Fit width"
    | "Toggle scale mode"
    | "Toggle marking labels"
    | "Toggle viewport information"
>;

export type i18nDialog = Recordify<
    | "Are you sure you want to load this image?\n\nIt will remove the previously loaded image and all existing forensic marks."
    | "Are you sure you want to load markings data?\n\nIt will remove all existing forensic marks."
    | "The markings data was created with a different version of the application ({{version}}). Loading it might not work.\n\nAre you sure you want to load it?"
>;

export type i18nDescription = Recordify<"Prerendering radius">;
