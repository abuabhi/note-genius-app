
import Layout from "@/components/layout/Layout";
import SettingsForm from "@/components/settings/SettingsForm";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Home, Settings } from "lucide-react";

const SettingsPage = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-mint-50/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
          {/* Glass morphism container with modern spacing */}
          <div className="backdrop-blur-sm bg-white/40 rounded-2xl border border-white/20 shadow-xl shadow-mint-500/5 p-8 space-y-8">
            
            {/* Breadcrumb with modern styling */}
            <div className="flex items-center justify-between">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/dashboard" className="flex items-center gap-2 text-slate-600 hover:text-mint-600">
                      <Home className="h-4 w-4" />
                      Dashboard
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <span className="flex items-center gap-2 text-mint-700 font-medium">
                      <Settings className="h-4 w-4" />
                      Settings
                    </span>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              
              <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Auto-save enabled</span>
              </div>
            </div>

            {/* Header with gradient accent */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-mint-500/5 to-blue-500/5 rounded-2xl blur-xl"></div>
              <div className="relative">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Settings</h1>
                <p className="text-slate-600">Manage your account preferences and study settings</p>
              </div>
            </div>

            {/* Settings Form with enhanced container */}
            <div className="relative">
              <SettingsForm />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;
