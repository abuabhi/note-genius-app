
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { NavigationItem } from "./NavigationItem";
import { useLocation } from "react-router-dom";
import { adminItems } from "./navigationData";

export const AdminNavigationGroup = () => {
  const location = useLocation();

  return (
    <AccordionItem value="admin" className="border-none">
      <AccordionTrigger className="py-2 px-4 text-sm font-medium hover:no-underline text-amber-500">
        Admin
      </AccordionTrigger>
      <AccordionContent className="pb-1">
        <div className="flex flex-col gap-1 pl-2">
          {adminItems.map((item) => {
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
  );
};
