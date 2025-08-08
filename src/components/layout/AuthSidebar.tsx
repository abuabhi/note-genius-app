
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { Navigation } from "@/components/ui/sidebar/Navigation";
import { useSidebar } from "@/components/ui/sidebar";


const AuthSidebar = () => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <div className="relative h-screen">
      <Sidebar className="border-r border-mint-100/60 bg-gradient-to-b from-white via-mint-50/20 to-white h-full shadow-lg shadow-mint-100/20 backdrop-blur-sm">
        <SidebarContent className="p-0 h-full overflow-y-auto">
          <Navigation isCollapsed={isCollapsed} />
        </SidebarContent>
      </Sidebar>
      
    </div>
  );
};

export default AuthSidebar;
