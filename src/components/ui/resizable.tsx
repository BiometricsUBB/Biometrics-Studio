import * as ResizablePrimitive from "react-resizable-panels";

import { cn } from "@/lib/utils/shadcn";
import { ComponentProps } from "react";
import { GripVertical } from "lucide-react";
import { ICON } from "@/lib/utils/const";

type ResizablePanelGroupProps = ComponentProps<
    typeof ResizablePrimitive.PanelGroup
>;
function ResizablePanelGroup({
    className,
    ...props
}: ResizablePanelGroupProps) {
    return (
        <ResizablePrimitive.PanelGroup
            className={cn(
                "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
                className
            )}
            {...props}
        />
    );
}

type ResizablePanelProps = ComponentProps<typeof ResizablePrimitive.Panel>;
const ResizablePanel = ResizablePrimitive.Panel;

type ResizableHandleProps = ComponentProps<
    typeof ResizablePrimitive.PanelResizeHandle
> & { withHandle?: boolean };
function ResizableHandle({
    withHandle,
    className,
    ...props
}: ResizableHandleProps) {
    return (
        <ResizablePrimitive.PanelResizeHandle
            className={cn(
                "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",
                className
            )}
            {...props}
        >
            {withHandle && (
                <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
                    <GripVertical
                        size={ICON.SIZE}
                        strokeWidth={ICON.STROKE_WIDTH}
                    />
                </div>
            )}
        </ResizablePrimitive.PanelResizeHandle>
    );
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
export type {
    ResizablePanelGroupProps,
    ResizablePanelProps,
    ResizableHandleProps,
};
