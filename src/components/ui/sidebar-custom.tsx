
"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState } from "react";
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
        "sidebar fixed left-0 z-40 h-screen shrink-0 border-r"
      )}
      initial={isCollapsed ? "closed" : "open"}
      animate={isCollapsed ? "closed" : "open"}
      variants={sidebarVariants}
      transition={transitionProps}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      <motion.div
        className={`relative z-40 flex text-muted-foreground h-screen shrink-0 flex-col bg-white dark:bg-black transition-all`}
        variants={contentVariants}
      >
        {/* Main Navigation - Takes up full space */}
        <div className="flex-1 overflow-auto">
          <Navigation isCollapsed={isCollapsed} />
        </div>
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
