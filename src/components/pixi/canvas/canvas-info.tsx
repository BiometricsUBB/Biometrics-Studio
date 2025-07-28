import { cn } from "@/lib/utils/shadcn";
import { HTMLAttributes, useRef } from "react";
import { round } from "@/lib/utils/math/round";
import { useCanvasContext } from "./hooks/useCanvasContext";
import { useGlobalViewport } from "../viewport/hooks/useGlobalViewport";

export function Row({
    label = "",
    value,
}: {
    label?: string;
    value?: number | string;
}) {
    return (
        <div className="flex justify-between">
            <div>{label}</div>
            <div>{value}</div>
        </div>
    );
}

export type CanvasInfoProps = HTMLAttributes<HTMLDivElement>;
export function CanvasInfo({ className, ...props }: CanvasInfoProps) {
    const { id } = useCanvasContext();
    const viewport = useGlobalViewport(id, { autoUpdate: true });
    const filename = viewport?.children[0]?.name;
    const ref = useRef<HTMLDivElement>(null);

    return (
        <div
            ref={ref}
            className={cn(
                "absolute min-w-[15ch] flex flex-col items-start bottom-0 left-0 bg-background/50 p-1",
                className
            )}
            {...props}
        >
            {filename && <Row value={filename} />}
            <Row
                value={`(${-round(viewport?.corner?.x ?? 0)},${-round(viewport?.corner?.y ?? 0)})`}
            />
            <Row value={`${round(viewport?.scaled ?? 0, 2)}x`} />
        </div>
    );
}
