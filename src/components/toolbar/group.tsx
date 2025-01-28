import { cn } from "@/lib/utils/shadcn";
import { HTMLAttributes } from "react";

export type ToolbarGroupProps = HTMLAttributes<HTMLDivElement>;
export function ToolbarGroup({ className, ...props }: ToolbarGroupProps) {
    return (
        <div
            className={cn("flex gap-0.5 items-center", className)}
            {...props}
        />
    );
}
