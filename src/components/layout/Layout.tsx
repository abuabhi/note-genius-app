
import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import NavBar from "./NavBar";
import Footer from "./Footer";
import AuthSidebar from "./AuthSidebar";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { pathname } = useLocation();
  const publicRoutes = ['/', '/about', '/pricing', '/faq', '/contact', '/login', '/signup'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Added to debug layout rendering
  console.log("Layout rendering:", { pathname, isPublicRoute });

  if (isPublicRoute) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-mint-50/30 to-mint-50/10">
        <NavBar />
        <main className="flex-grow pt-16">
          {children}
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-b from-white via-mint-50/30 to-mint-50/10">
        <AuthSidebar />
        <SidebarInset>
          <div className="flex flex-col flex-1">
            <NavBar />
            <main className="flex-grow p-4">
              <div className="flex items-center gap-2 mb-4">
                <SidebarTrigger />
              </div>
              {children}
            </main>
            <Footer />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
