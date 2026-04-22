import { createRoot } from "react-dom/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";

interface ConfirmOptions {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}

/**
 * Promise-based replacement for window.confirm() using shadcn AlertDialog.
 * Looks native to the app, accessible, and works on mobile webviews.
 */
export function confirmDialog(options: ConfirmOptions = {}): Promise<boolean> {
  return new Promise((resolve) => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    const cleanup = () => {
      setTimeout(() => {
        root.unmount();
        container.remove();
      }, 200);
    };

    const ConfirmHost = () => {
      const [open, setOpen] = useState(false);
      useEffect(() => {
        setOpen(true);
      }, []);

      const handle = (value: boolean) => {
        setOpen(false);
        resolve(value);
        cleanup();
      };

      return (
        <AlertDialog open={open} onOpenChange={(o) => !o && handle(false)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{options.title ?? "Are you sure?"}</AlertDialogTitle>
              {options.description && (
                <AlertDialogDescription>{options.description}</AlertDialogDescription>
              )}
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => handle(false)}>
                {options.cancelText ?? "Cancel"}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handle(true)}
                className={options.destructive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : undefined}
              >
                {options.confirmText ?? "Confirm"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    };

    root.render(<ConfirmHost />);
  });
}
