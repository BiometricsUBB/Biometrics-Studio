import { cn } from "@/lib/utils/shadcn";
import { Input } from "@/components/ui/input";
import { t } from "i18next";
import { useDebouncedCallback } from "use-debounce";
import { MarkingCharacteristicsStore } from "@/lib/stores/MarkingCharacteristics/MarkingCharacteristics";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { ICON, IS_DEV_ENVIRONMENT } from "@/lib/utils/const";
import { Toggle } from "@/components/ui/toggle";
import { CANVAS_ID } from "@/components/pixi/canvas/hooks/useCanvasContext";
import { WorkingModeStore } from "@/lib/stores/WorkingMode";
import CharacteristicsKeybinding from "@/components/dialogs/marking-characteristics/characteristics-keybinding";
import { KeybindingsStore } from "src/lib/stores/Keybindings";

function MarkingCharacteristicsTable() {
    const workingMode = WorkingModeStore.state.workingMode!;

    const characteristics = MarkingCharacteristicsStore.use(state =>
        state.characteristics.filter(c => c.category === workingMode)
    );

    const setCharacteristic = useDebouncedCallback(
        (id, value) =>
            MarkingCharacteristicsStore.actions.characteristics.setCharacteristic(
                id,
                value
            ),
        10
    );

    const keybindings = KeybindingsStore.use(state =>
        state.characteristicsKeybindings.filter(
            k => k.workingMode === workingMode
        )
    );

    return (
        <div className="h-[50vh] w-[50vw] no-scrollbar overflow-y-auto">
            <table className="w-full">
                <thead>
                    <TableRow className={cn("bg-card")}>
                        <TableHead className="text-center text-card-foreground">
                            {t(`MarkingCharacteristic.Keys.displayName`, {
                                ns: "object",
                            })}
                        </TableHead>
                        <TableHead className="text-center text-card-foreground">
                            {t(
                                `MarkingCharacteristic.Keys.characteristicName`,
                                {
                                    ns: "object",
                                }
                            )}
                        </TableHead>
                        <TableHead className="text-center text-card-foreground">
                            {t(`MarkingCharacteristic.Keys.markingClass`, {
                                ns: "object",
                            })}
                        </TableHead>
                        <TableHead className="text-center text-card-foreground">
                            {t(`MarkingCharacteristic.Keys.backgroundColor`, {
                                ns: "object",
                            })}
                        </TableHead>
                        <TableHead className="text-center text-card-foreground">
                            {t(`MarkingCharacteristic.Keys.textColor`, {
                                ns: "object",
                            })}
                        </TableHead>
                        <TableHead className="text-center text-card-foreground">
                            {t(`MarkingCharacteristic.Keys.size`, {
                                ns: "object",
                            })}
                        </TableHead>
                        <TableHead className="text-center text-card-foreground">
                            Keybinding
                        </TableHead>
                        {IS_DEV_ENVIRONMENT && <TableHead />}
                    </TableRow>
                </thead>
                <tbody>
                    {characteristics.map(item => (
                        <TableRow key={item.id}>
                            <TableCell>
                                <Input
                                    className="h-6 !p-0"
                                    title={`${t("MarkingCharacteristic.Keys.displayName", { ns: "object" })}`}
                                    type="text"
                                    value={item.displayName}
                                    onChange={e => {
                                        setCharacteristic(item.id, {
                                            displayName: e.target.value,
                                        });
                                    }}
                                />
                            </TableCell>
                            {/* 
                            
                                TODO:
                                Allowed changing the characteristicName input in DEV_ENVIRONMENT until the adding method is redesigned; 
                                the characteristicName input should be repalced in the future to only display the characteristicName through the app;

                            */}
                            <TableCell>
                                {IS_DEV_ENVIRONMENT ? (
                                    <Input
                                        className="h-6 !p-0"
                                        title={`${t("MarkingCharacteristic.Keys.characteristicName", { ns: "object" })}`}
                                        type="text"
                                        value={item.characteristicName}
                                        onChange={e => {
                                            setCharacteristic(item.id, {
                                                characteristicName:
                                                    e.target.value,
                                            });
                                        }}
                                    />
                                ) : (
                                    <span className="p-1 cursor-default">
                                        {item.characteristicName}
                                    </span>
                                )}
                            </TableCell>
                            <TableCell className={cn("p-1 cursor-default")}>
                                {t(
                                    `Marking.Keys.markingClass.Keys.${item.markingClass}`,
                                    {
                                        ns: "object",
                                    }
                                )}
                            </TableCell>
                            <TableCell>
                                <Input
                                    className="size-6 cursor-pointer m-auto"
                                    title={`${t("MarkingCharacteristic.Keys.backgroundColor", { ns: "object" })}`}
                                    type="color"
                                    value={item.backgroundColor as string}
                                    onChange={e => {
                                        setCharacteristic(item.id, {
                                            backgroundColor: e.target.value,
                                        });
                                    }}
                                />
                            </TableCell>
                            <TableCell>
                                <Input
                                    className="size-6 cursor-pointer m-auto"
                                    title={`${t("MarkingCharacteristic.Keys.textColor", { ns: "object" })}`}
                                    type="color"
                                    value={item.textColor as string}
                                    onChange={e => {
                                        setCharacteristic(item.id, {
                                            textColor: e.target.value,
                                        });
                                    }}
                                />
                            </TableCell>
                            <TableCell>
                                <Input
                                    className="w-10 h-6 !p-0"
                                    min={6}
                                    max={32}
                                    title={`${t("MarkingCharacteristic.Keys.size", { ns: "object" })}`}
                                    type="number"
                                    value={item.size}
                                    onChange={e => {
                                        setCharacteristic(item.id, {
                                            size: Number(e.target.value),
                                        });
                                    }}
                                />
                            </TableCell>
                            <TableCell>
                                <CharacteristicsKeybinding
                                    boundKey={
                                        keybindings.find(
                                            k => k.characteristicId === item.id
                                        )?.boundKey ?? undefined
                                    }
                                    mode={workingMode}
                                    characteristicId={item.id}
                                />
                            </TableCell>
                            {/*  The option to delete characteristics in the UI has been disabled for users. 
                            However, this functionality remains unchanged and available in the developer version. 
                            It will be restored after the release of the improved version of characteristics/presets. */}
                            {IS_DEV_ENVIRONMENT && (
                                <TableCell className="h-full text-center align-middle">
                                    <Toggle
                                        title={t("Remove")}
                                        className="block"
                                        size="icon"
                                        variant="outline"
                                        pressed={false}
                                        disabled={
                                            MarkingCharacteristicsStore.actions.characteristics.checkIfCharacteristicIsInUse(
                                                item.id,
                                                CANVAS_ID.LEFT
                                            ) ||
                                            MarkingCharacteristicsStore.actions.characteristics.checkIfCharacteristicIsInUse(
                                                item.id,
                                                CANVAS_ID.RIGHT
                                            )
                                        }
                                        onClickCapture={() => {
                                            MarkingCharacteristicsStore.actions.characteristics.removeById(
                                                item.id
                                            );

                                            KeybindingsStore.actions.characteristicsKeybindings.remove(
                                                item.id,
                                                workingMode
                                            );
                                        }}
                                    >
                                        <Trash2
                                            size={ICON.SIZE}
                                            strokeWidth={ICON.STROKE_WIDTH}
                                        />
                                    </Toggle>
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default MarkingCharacteristicsTable;
