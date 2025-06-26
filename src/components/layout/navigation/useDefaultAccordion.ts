
import { useLocation } from 'react-router-dom';
import { navigationGroups } from './navigationData';

export const useDefaultAccordion = () => {
  const location = useLocation();
  
  // Find which group contains the current route
  const activeGroup = navigationGroups.find(group =>
    group.items.some(item => item.href === location.pathname)
  );
  
  // Always open the active group and study-tools by default
  const defaultOpen = ['study-tools'];
  if (activeGroup && !defaultOpen.includes(activeGroup.id)) {
    defaultOpen.push(activeGroup.id);
  }
  
  return defaultOpen;
};
