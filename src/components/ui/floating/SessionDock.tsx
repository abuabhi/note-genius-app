
// This file is deprecated - use UnifiedSessionDock instead
import { UnifiedSessionDock } from './UnifiedSessionDock';

export const SessionDock = () => {
  console.warn('⚠️ SessionDock is deprecated, use UnifiedSessionDock instead');
  return <UnifiedSessionDock />;
};
