import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";

const StickyMobileCTA: React.FC = () => {
  const { user, loading } = useAuth();

  // Show only for unauthenticated users on small screens
  if (loading || user) return null;

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40">
      <div className="mx-auto max-w-7xl px-3 pb-3 sm:px-4 sm:pb-4">
        <div className="rounded-xl border border-mint-200 bg-white/90 backdrop-blur shadow-lg p-3 sm:p-4 flex items-center justify-between gap-3">
          <div className="text-sm text-gray-700 font-medium">
            Ready to study smarter?
          </div>
          <Button asChild size="sm" className="bg-mint-600 text-white hover:bg-mint-700 min-h-[40px] px-4 text-sm font-medium">
            <Link to="/signup" aria-label="Start your free account">Start Free</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StickyMobileCTA;
