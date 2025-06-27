
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { Navigation } from "@/components/ui/sidebar/Navigation";

const AuthSidebar = () => {
  return (
    <Sidebar>
      <SidebarContent className="p-0">
        {/* Simple Navigation without accordion/grouping */}
        <Navigation isCollapsed={false} />
      </SidebarContent>
    </Sidebar>
  );
};

export default AuthSidebar;
