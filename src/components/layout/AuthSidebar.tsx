
import { Sidebar, SidebarContent, SidebarSeparator, SidebarFooter } from "@/components/ui/sidebar";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { UserTierDisplay } from "./UserTierDisplay";
import { Accordion } from "@/components/ui/accordion";
import { navigationData } from "./navigation/navigationData";
import { NavigationGroup } from "./navigation/NavigationGroup";
import { useDefaultAccordion } from "./navigation/useDefaultAccordion";

const AuthSidebar = () => {
  const { userProfile } = useRequireAuth();
  const defaultAccordionValue = useDefaultAccordion();
  
  return (
    <Sidebar>
      <SidebarContent>
        {/* Main Navigation */}
        <Accordion type="multiple" defaultValue={defaultAccordionValue} className="w-full">
          {navigationData.map((group) => (
            <NavigationGroup
              key={group.id}
              id={group.id}
              title={group.title}
              items={group.items}
              isOpen={defaultAccordionValue.includes(group.id)}
            />
          ))}
        </Accordion>
      </SidebarContent>
      
      {/* Footer with User Tier Display */}
      <SidebarFooter>
        <SidebarSeparator />
        <UserTierDisplay />
      </SidebarFooter>
    </Sidebar>
  );
};

export default AuthSidebar;
