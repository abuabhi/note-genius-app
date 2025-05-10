
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { NavigationItem } from "./NavigationItem";
import { useLocation } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

export interface NavigationItemType {
  title: string;
  path: string;
  icon: any;
}

interface NavigationGroupProps {
  id: string;
  title: string;
  items: NavigationItemType[];
  isOpen: boolean;
}

export const NavigationGroup = ({ id, title, items, isOpen }: NavigationGroupProps) => {
  const location = useLocation();

  return (
    <>
      <Separator className="my-2" />
      <AccordionItem value={id} className="border-none">
        <AccordionTrigger className="py-2 px-4 text-sm font-medium hover:no-underline">
          {title}
        </AccordionTrigger>
        <AccordionContent className="pb-1">
          <div className="flex flex-col gap-1 pl-2">
            {items.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavigationItem
                  key={item.path}
                  title={item.title}
                  path={item.path}
                  icon={item.icon}
                  isActive={isActive}
                />
              );
            })}
          </div>
        </AccordionContent>
      </AccordionItem>
    </>
  );
};
