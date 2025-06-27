
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { Navigation } from "@/components/ui/sidebar/Navigation";
import { SessionTimer } from "@/components/ui/sidebar/SessionTimer";
import { useSidebar } from "@/components/ui/sidebar";

const AuthSidebar = () => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <div className="relative h-screen">
      <Sidebar className="border-r border-gray-200/60 shadow-lg bg-white/80 backdrop-blur-md h-full">
        <SidebarContent className="p-0 h-full overflow-y-auto">
          <Navigation isCollapsed={isCollapsed} />
        </SidebarContent>
      </Sidebar>
      
      {/* Fixed Timer at Bottom-Left */}
      <div className="fixed bottom-4 left-4 z-50">
        <SessionTimer isCollapsed={isCollapsed} />
      </div>
    </div>
  );
};

export default AuthSidebar;
