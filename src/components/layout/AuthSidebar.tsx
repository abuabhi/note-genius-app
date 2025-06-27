
import { Sidebar, SidebarContent, SidebarFooter } from "@/components/ui/sidebar";
import { Navigation } from "@/components/ui/sidebar/Navigation";
import { SessionTimer } from "@/components/ui/sidebar/SessionTimer";
import { useSidebar } from "@/components/ui/sidebar";

const AuthSidebar = () => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar className="border-r border-gray-200/60 shadow-lg bg-white/80 backdrop-blur-md">
      <SidebarContent className="p-0">
        <Navigation isCollapsed={isCollapsed} />
      </SidebarContent>
      
      <SidebarFooter className="p-0">
        <SessionTimer isCollapsed={isCollapsed} />
      </SidebarFooter>
    </Sidebar>
  );
};

export default AuthSidebar;
