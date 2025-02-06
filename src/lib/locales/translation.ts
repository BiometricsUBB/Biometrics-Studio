import { MARKING_CLASS } from "@/lib/markings/MarkingBase";
import { RayMarking } from "@/lib/markings/RayMarking";
import { PointMarking } from "@/lib/markings/PointMarking";
import { LineSegmentMarking } from "@/lib/markings/LineSegmentMarking";
import { MarkingCharacteristic } from "@/lib/markings/MarkingCharacteristic";
import { WORKING_MODE } from "@/views/selectMode";
import { BoundingBoxMarking } from "@/lib/markings/BoundingBoxMarking";
import { PRERENDER_RADIUS_OPTIONS, THEMES } from "../stores/GlobalSettings";

type Recordify<T> = { [K in Extract<T, string> as `${K}`]: string };

export type i18nKeywords = Recordify<
    | "Working mode"
    | "Settings"
    | "Language"
    | "Markings"
    | "Debug"
    | "Theme"
    | "Rendering"
    | "Characteristics"
    | "Remove"
    | "Add"
>;

export type i18nModes = Recordify<WORKING_MODE>;

export type i18nCursor = {
    Mode: Recordify<"Selection" | "Marking">;
};

export type i18nObject = {
    Marking: {
        Name: string;
        Keys: Omit<
            Recordify<
                | keyof RayMarking
                | keyof PointMarking
                | keyof LineSegmentMarking
                | keyof BoundingBoxMarking
            >,
            | "markingClass"
            | "calculateOriginViewportPosition"
            | "calculateEndpointViewportPosition"
        > & {
            markingClass: {
                Name: string;
                Keys: Recordify<MARKING_CLASS>;
            };
        };
    };
    MarkingCharacteristic: {
        Name: string;
        Keys: Recordify<keyof MarkingCharacteristic>;
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
    | "Export marking characteristics"
    | "Import marking characteristics"
>;

export type i18nDialog = Recordify<
    | "Are you sure you want to load this image?\n\nIt will remove the previously loaded image and all existing forensic marks."
    | "Are you sure you want to load markings data?\n\nIt will remove all existing forensic marks."
    | "The markings data was created with a different version of the application ({{version}}). Loading it might not work.\n\nAre you sure you want to load it?"
    | "Marking characteristics were exported from a different version of the application ({{version}}). Loading it might not work.\n\nAre you sure you want to load it?"
    | "The imported marking characteristics have conflicts with the existing ones:\n{{conflicts}}\n\nDo you want to overwrite them?"
    | "Overwrite marking characteristics?"
    | "The imported markings data contains characteristics that are not present in the application. Would you like to:\n1. Automatically create default characteristics for the missing ones?\n2. Cancel and manually import the characteristics from a file?"
    | "Missing marking characteristics detected"
    | "The markings data was created with a different working mode ({{mode}}). Change the working mode to ({{mode}}) to load the data."
    | "Please select your working mode"
    | "You are trying to load marking characteristics for a non-existing working mode."
>;

export type i18nDescription = Recordify<"Prerendering radius">;
