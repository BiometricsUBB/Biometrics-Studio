import { i18nDialog as Dictionary } from "@/lib/locales/translation";

const d: Dictionary = {
    "Are you sure you want to load this image?\n\nIt will remove the previously loaded image and all existing forensic marks.":
        "Are you sure you want to load this image?\n\nIt will remove the previously loaded image and all existing forensic marks.",
    "Are you sure you want to load markings data?\n\nIt will remove all existing forensic marks.":
        "Are you sure you want to load markings data?\n\nIt will remove all existing forensic marks.",
    "The markings data was created with a different version of the application ({{version}}). Loading it might not work.\n\nAre you sure you want to load it?":
        "The markings data was created with a different version of the application ({{version}}). Loading it might not work.\n\nAre you sure you want to load it?",
    "Marking characteristics were exported from a different version of the application ({{version}}). Loading it might not work.\n\nAre you sure you want to load it?":
        "Marking characteristics were exported from a different version of the application ({{version}}). Loading it might not work.\n\nAre you sure you want to load it?",
    "The imported marking characteristics have conflicts with the existing ones:\n{{conflicts}}\n\nDo you want to overwrite them?":
        "The imported marking characteristics have conflicts with the existing ones:\n{{conflicts}}\n\nDo you want to overwrite them?",
    "Overwrite marking characteristics?": "Overwrite marking characteristics?",
    "The imported markings data contains characteristics that are not present in the application. Would you like to:\n1. Automatically create default characteristics for the missing ones?\n2. Cancel and manually import the characteristics from a file?":
        "The imported markings data contains characteristics that are not present in the application. Would you like to:\n1. Automatically create default characteristics for the missing ones?\n2. Cancel and manually import the characteristics from a file?",
    "Missing marking characteristics detected":
        "Missing marking characteristics detected",
    "The markings data was created with a different working mode ({{mode}}). Change the working mode to ({{mode}}) to load the data.":
        "The markings data was created with a different working mode ({{mode}}). Change the working mode to ({{mode}}) to load the data.",
};

export default d;
