
import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as React from "react";

import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center rounded-lg bg-muted p-0.5 text-muted-foreground/70",
      // Vertical orientation support
      "data-[orientation=vertical]:flex-col data-[orientation=vertical]:h-full",
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium outline-offset-2 transition-all hover:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:shadow-black/5",
      // Better vertical styling for active state
      "data-[orientation=vertical]:justify-start data-[orientation=vertical]:w-full",
      "data-[orientation=vertical][data-state=active]:border-r-2 data-[orientation=vertical][data-state=active]:border-mint-500 data-[orientation=vertical][data-state=active]:bg-mint-50",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70",
      // Fix vertical layout
      "data-[orientation=vertical]:mt-0 data-[orientation=vertical]:ml-2 data-[orientation=vertical]:h-full data-[orientation=vertical]:flex-1",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsContent, TabsList, TabsTrigger };
