/* eslint-disable no-throw-literal */

import { CanvasMetadata } from "@/components/pixi/canvas/hooks/useCanvasContext";
import { save } from "@tauri-apps/plugin-dialog";
import { getVersion } from "@tauri-apps/api/app";
import { t } from "i18next";
import { Viewport } from "pixi-viewport";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { showErrorDialog } from "@/lib/errors/showErrorDialog";
import { MarkingsStore } from "@/lib/stores/Markings";
import { BaseTexture, Sprite } from "pixi.js";
import { getOppositeCanvasId } from "@/components/pixi/canvas/utils/get-opposite-canvas-id";
import { getCanvas } from "@/components/pixi/canvas/hooks/useCanvas";
import { basename } from "@tauri-apps/api/path";
import { MARKING_TYPE, MarkingBase } from "@/lib/markings/MarkingBase";
import { RayMarking } from "@/lib/markings/RayMarking";
import { round } from "@/lib/utils/math/round";
import { LineSegmentMarking } from "@/lib/markings/LineSegmentMarking";

type ImageInfo = {
    name: string | null;
    path: string | null;
    sha256: string;
    size: {
        width: number;
        height: number;
    };
};

type SoftwareInfo = {
    name: string;
    version: string;
};

type MarkingStyleType = {
    typeId: number;
    type: MarkingBase["type"];
    background_color: MarkingBase["backgroundColor"];
    text_color: MarkingBase["textColor"];
    size: MarkingBase["size"];
};

export type ExportObject = {
    metadata: {
        software: SoftwareInfo;
        image: ImageInfo | null;
        compared_image: ImageInfo | null;
    };
    data: {
        marking_types: MarkingStyleType[];
        markings: ({
            typeId: MarkingStyleType["typeId"];
        } & {
            typeId: number;
            angleRad?: RayMarking["angleRad"];
            endpoint?: LineSegmentMarking["endpoint"];
            label: MarkingBase["label"];
            origin: MarkingBase["origin"];
        })[];
    };
};

function getImageData(picture: Sprite | undefined): ImageInfo | null {
    if (picture === undefined) return null;

    // eslint-disable-next-line no-underscore-dangle
    const texture: BaseTexture | undefined = picture?._texture.baseTexture;

    if (texture === undefined)
        throw new Error("Could not find texture for image");

    return {
        name: picture.name,
        // @ts-expect-error custom property should exist
        path: picture.path,
        // @ts-expect-error custom property should exist
        sha256: picture.hash,
        size: {
            width: texture.width,
            height: texture.height,
        },
    };
}

function getMarkingTypes(markings: MarkingBase[]): MarkingStyleType[] {
    const markingTypes: MarkingStyleType[] = [];

    let typeId = 0;

    markings.forEach(marking => {
        const { backgroundColor, textColor, size, type } = marking;

        const existingType = markingTypes.find(styleType => {
            return (
                styleType.background_color === backgroundColor &&
                styleType.text_color === textColor &&
                styleType.type === type &&
                styleType.size === size
            );
        });

        if (!existingType) {
            markingTypes.push({
                typeId,
                type,
                background_color: backgroundColor,
                text_color: textColor,
                size,
            });
            typeId += 1;
        }
    });

    return markingTypes;
}

function getReducedMarkings(
    markings: MarkingBase[],
    styleTypes: MarkingStyleType[]
): {
    typeId: MarkingStyleType["typeId"];
    label: MarkingBase["label"];
    origin: MarkingBase["origin"];
    endpoint?: LineSegmentMarking["endpoint"];
    angleRad?: RayMarking["angleRad"];
}[] {
    return markings.map(marking => {
        const { backgroundColor, textColor, size, type } = marking;

        const markingType = styleTypes.find(styleType => {
            return (
                styleType.background_color === backgroundColor &&
                styleType.text_color === textColor &&
                styleType.type === type &&
                styleType.size === size
            );
        });

        if (!markingType) {
            throw new Error(
                `Could not find marking type for marking with background color ${backgroundColor}, text color ${textColor}, size ${size} and type ${type}`
            );
        }

        return {
            typeId: markingType.typeId,
            label: marking.label,
            origin: {
                x: round(marking.origin.x),
                y: round(marking.origin.y),
            },
            ...(marking.type === MARKING_TYPE.RAY && {
                angleRad: (marking as RayMarking).angleRad,
            }),
            ...(marking.type === MARKING_TYPE.LINE_SEGMENT && {
                endpoint: (marking as LineSegmentMarking).endpoint,
            }),
        };
    });
}

async function getData(
    viewport: Viewport,
    picture?: Sprite,
    oppositePicture?: Sprite
): Promise<string> {
    const id = viewport.name as CanvasMetadata["id"] | null;
    if (id === null) throw new Error("Canvas ID not found");

    const store = MarkingsStore(id);
    const { markings } = store.state;

    const appVersion = await getVersion();

    const markingStyleTypes = getMarkingTypes(markings);
    const reducedMarkings = getReducedMarkings(markings, markingStyleTypes);

    const exportObject: ExportObject = {
        metadata: {
            software: {
                name: "biometrics-studio",
                version: appVersion,
            },
            image: getImageData(picture),
            compared_image: getImageData(oppositePicture),
        },
        data: {
            marking_types: markingStyleTypes,
            markings: reducedMarkings,
        },
    };

    return JSON.stringify(exportObject, null, 2);
}

function validateViewport(viewport: Viewport | null) {
    if (viewport === null) throw new Error(`Viewport is not loaded`);

    const childrenCount = viewport.children.length;
    if (childrenCount > 1)
        throw new Error(
            `Expected to only have one image loaded, but found ${childrenCount} images in viewport '${viewport.name}'`
        );
}

export async function saveMarkingsDataWithDialog(viewport: Viewport) {
    try {
        validateViewport(viewport);
    } catch (error) {
        showErrorDialog(error);
        return;
    }

    const picture = (() => {
        try {
            return viewport.getChildAt(0) as Sprite;
        } catch {
            return undefined;
        }
    })();

    const id = viewport.name as CanvasMetadata["id"] | null;
    const oppositePicture = (() => {
        if (id !== null) {
            const oppositeId = getOppositeCanvasId(id);
            const { viewport: oppositeViewport } = getCanvas(oppositeId, true);
            try {
                validateViewport(oppositeViewport);

                return oppositeViewport?.getChildAt(0) as Sprite | undefined;
            } catch {
                return undefined;
            }
        } else {
            return undefined;
        }
    })();

    try {
        const filepath = await save({
            title: t("Save markings data to a JSON file", {
                ns: "tooltip",
            }),
            filters: [
                {
                    name: "JSON",
                    extensions: ["json"],
                },
            ],
            canCreateDirectories: true,
            defaultPath: `${
                picture === undefined || picture.name === null
                    ? "marking"
                    : await basename(picture.name)
            }.json`,
        });

        if (filepath === null) return;

        const data = await getData(viewport, picture, oppositePicture);
        await writeTextFile(filepath, data);
    } catch (error) {
        showErrorDialog(error);
    }
}
