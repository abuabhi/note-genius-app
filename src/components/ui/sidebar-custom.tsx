
"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState } from "react";
import { UserSection } from "./sidebar/UserSection";
import { Navigation } from "./sidebar/Navigation";
import { 
  sidebarVariants, 
  contentVariants,
  transitionProps 
} from "./sidebar/motion";

export function CustomSidebar() {
  // Start with sidebar expanded instead of collapsed
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  return (
    <motion.div
      className={cn(
        "sidebar fixed left-0 z-40 h-full shrink-0 border-r"
      )}
      initial={isCollapsed ? "closed" : "open"}
      animate={isCollapsed ? "closed" : "open"}
      variants={sidebarVariants}
      transition={transitionProps}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      <motion.div
        className={`relative z-40 flex text-muted-foreground h-full shrink-0 flex-col bg-white dark:bg-black transition-all`}
        variants={contentVariants}
      >
        {/* Main Navigation - takes up available space */}
        <div className="flex-1">
          <Navigation isCollapsed={isCollapsed} />
        </div>
        
        {/* User Avatar Section - moved to bottom */}
        <UserSection isCollapsed={isCollapsed} />
      </motion.div>
    </motion.div>
  );
}

export function SidebarDemo() {
  return (
    <div className="flex h-screen w-screen flex-row">
      <CustomSidebar />
      <main className="flex h-screen grow flex-col overflow-auto">
        {/* Content goes here */}
      </main>
    </div>
  );
}
