
import { useLocation } from "react-router-dom";
import { navigationGroups } from "./navigationData";

export const useDefaultAccordion = () => {
  const { pathname } = useLocation();
  
  // Find which accordion items should be open by default based on current path
  const getDefaultAccordionValue = () => {
    const currentPath = pathname;
    const openGroups = [];
    
    // Check main navigation items
    for (const group of navigationGroups) {
      for (const item of group.items) {
        if (currentPath === item.path) {
          openGroups.push(group.id);
          break;
        }
      }
    }
    
    // Check admin items
    if (currentPath.startsWith('/admin')) {
      openGroups.push('admin');
    }
    
    return openGroups;
  };

  return getDefaultAccordionValue();
};
