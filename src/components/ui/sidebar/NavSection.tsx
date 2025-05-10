
import { ReactNode } from "react";

interface NavSectionProps {
  title: string;
  children: ReactNode;
}

export const NavSection = ({ title, children }: NavSectionProps) => {
  return (
    <div className="py-1">
      <p className="px-2 text-xs font-medium text-muted-foreground mb-1">{title}</p>
      {children}
    </div>
  );
};
