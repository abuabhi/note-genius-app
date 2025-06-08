
import * as React from "react"
import { Link } from "react-router-dom"
import { ChevronRight, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

const OptimizedBreadcrumb = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"nav"> & {
    separator?: React.ReactNode
  }
>(({ ...props }, ref) => <nav ref={ref} aria-label="breadcrumb" {...props} />)
OptimizedBreadcrumb.displayName = "OptimizedBreadcrumb"

const OptimizedBreadcrumbList = React.forwardRef<
  HTMLOListElement,
  React.ComponentPropsWithoutRef<"ol">
>(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn(
      "flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5",
      className
    )}
    {...props}
  />
))
OptimizedBreadcrumbList.displayName = "OptimizedBreadcrumbList"

const OptimizedBreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn("inline-flex items-center gap-1.5", className)}
    {...props}
  />
))
OptimizedBreadcrumbItem.displayName = "OptimizedBreadcrumbItem"

const OptimizedBreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<typeof Link>
>(({ className, ...props }, ref) => {
  return (
    <Link
      ref={ref}
      className={cn("transition-colors hover:text-foreground", className)}
      {...props}
    />
  )
})
OptimizedBreadcrumbLink.displayName = "OptimizedBreadcrumbLink"

const OptimizedBreadcrumbPage = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span">
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    role="link"
    aria-disabled="true"
    aria-current="page"
    className={cn("font-normal text-foreground", className)}
    {...props}
  />
))
OptimizedBreadcrumbPage.displayName = "OptimizedBreadcrumbPage"

const OptimizedBreadcrumbSeparator = ({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) => (
  <li
    role="presentation"
    aria-hidden="true"
    className={cn("[&>svg]:size-3.5", className)}
    {...props}
  >
    {children ?? <ChevronRight />}
  </li>
)
OptimizedBreadcrumbSeparator.displayName = "OptimizedBreadcrumbSeparator"

const OptimizedBreadcrumbEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    role="presentation"
    aria-hidden="true"
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More</span>
  </span>
)
OptimizedBreadcrumbEllipsis.displayName = "OptimizedBreadcrumbEllipsis"

export {
  OptimizedBreadcrumb,
  OptimizedBreadcrumbList,
  OptimizedBreadcrumbItem,
  OptimizedBreadcrumbLink,
  OptimizedBreadcrumbPage,
  OptimizedBreadcrumbSeparator,
  OptimizedBreadcrumbEllipsis,
}
