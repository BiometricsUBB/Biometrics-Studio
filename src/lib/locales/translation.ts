import { RayMarking } from "@/lib/markings/RayMarking";
import { PointMarking } from "@/lib/markings/PointMarking";
import { LineSegmentMarking } from "@/lib/markings/LineSegmentMarking";
import { MarkingType } from "@/lib/markings/MarkingType";
import { WORKING_MODE } from "@/views/selectMode";
import { BoundingBoxMarking } from "@/lib/markings/BoundingBoxMarking";
import { MARKING_CLASS } from "@/lib/markings/MARKING_CLASS";
import { THEMES } from "../stores/GlobalSettings";

type Recordify<T> = { [K in Extract<T, string> as `${K}`]: string };

export type i18nKeywords = Recordify<
    | "Working mode"
    | "Settings"
    | "Language"
    | "Markings"
    | "Debug"
    | "Theme"
    | "Types"
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
    MarkingType: {
        Name: string;
        Keys: Recordify<keyof MarkingType>;
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
    | "Export marking types"
    | "Import marking types"
    | "Markings data saved"
    | "Failed to save markings data"
>;

export type i18nDialog = Recordify<
    | "Are you sure you want to load this image?\n\nIt will remove the previously loaded image and all existing forensic marks."
    | "Are you sure you want to load markings data?\n\nIt will remove all existing forensic marks."
    | "You are trying to load markings data created with a newer app version (current app version: {{appVersion}}, but you try to load: {{fileVersion}}). Please update the application."
    | "This markings data file was created with an older, unsupported version of the app ({{fileVersion}}, minimum supported: {{minVersion}}). Loading it might not work.\n\nDo you want to proceed?"
    | "Marking types were exported from a different version of the application ({{version}}). Loading it might not work.\n\nAre you sure you want to load it?"
    | "The imported marking types have conflicts with the existing ones:\n{{conflicts}}\n\nDo you want to overwrite them?"
    | "Overwrite marking types?"
    | "The imported markings data contains types that are not present in the application. Would you like to:\n1. Automatically create default types for the missing ones?\n2. Cancel and manually import the types from a file?"
    | "Missing marking types detected"
    | "The markings data was created with a different working mode ({{mode}}). Change the working mode to ({{mode}}) to load the data."
    | "Please select your working mode"
    | "You are trying to load marking types for a non-existing working mode."
    | "No marking types found in the file"
    | "Marking types imported successfully"
    | "Marking types exported successfully"
    | "Error importing marking types"
    | "Error exporting marking types"
    | "This action will clear the current canvas. Are you sure you want to proceed?"
    | "Warning"
    | "Are you sure?"
>;

export type i18nKeybindings = Recordify<
    | "Keybinding"
    | "None"
    | "Press a key"
    | "Press a numeric key (0-9)"
    | "Press 'Del' to remove keybinding"
    | "'{{key}}' is not a  numeric key"
>;
