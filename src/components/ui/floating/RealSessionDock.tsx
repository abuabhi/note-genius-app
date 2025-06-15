
// This file is deprecated - use UnifiedSessionDock instead
import { UnifiedSessionDock } from './UnifiedSessionDock';

export const RealSessionDock = () => {
  console.warn('⚠️ RealSessionDock is deprecated, use UnifiedSessionDock instead');
  return <UnifiedSessionDock />;
};
