// This component has been removed - replaced by StudyAudioSection which uses Supabase music only
import { StudyAudioSection } from './sections/StudyAudioSection';

export const StudyAudioSidebarWidget = ({ isCollapsed }: { isCollapsed: boolean }) => {
  return <StudyAudioSection isCollapsed={isCollapsed} />;
};

export default StudyAudioSidebarWidget;