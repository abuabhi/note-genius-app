
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { Navigation } from "@/components/ui/sidebar/Navigation";

const AuthSidebar = () => {
  return (
    <Sidebar className="border-r border-gray-200/60 shadow-lg bg-white/80 backdrop-blur-md">
      <SidebarContent className="p-0">
        <Navigation isCollapsed={false} />
      </SidebarContent>
    </Sidebar>
  );
};

export default AuthSidebar;
