
import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import NavBar from "./NavBar";
import Footer from "./Footer";
import { CustomSidebar } from "../ui/sidebar-custom";
import { useAuth } from "@/contexts/auth";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const publicRoutes = ['/', '/about', '/pricing', '/faq', '/contact', '/login', '/signup'];
  const isPublicRoute = publicRoutes.includes(pathname);
  
  console.log("Layout rendering path:", pathname, "Public route:", isPublicRoute, "User:", !!user);

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
    <div className="min-h-screen flex w-full bg-gradient-to-b from-white via-mint-50/30 to-mint-50/10">
      <CustomSidebar />
      <div className="flex flex-col flex-1 ml-[3.05rem] transition-all">
        <NavBar />
        <main className="flex-grow p-4">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
