
import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import NavBar from "./NavBar";
import Footer from "./Footer";
import AuthSidebar from "./AuthSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

interface LayoutProps {
  children: ReactNode;
}

const publicRoutes = ['/', '/about', '/pricing', '/faq', '/contact', '/login', '/signup'];

const Layout = ({ children }: LayoutProps) => {
  const { pathname } = useLocation();
  const isPublicRoute = publicRoutes.includes(pathname);

  if (isPublicRoute) {
    return (
      <div className="min-h-screen flex flex-col">
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
        <div className="flex flex-col flex-1">
          <NavBar />
          <main className="flex-grow pt-16 px-4">
            <div className="flex items-center gap-2 mb-4">
              <SidebarTrigger />
            </div>
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
