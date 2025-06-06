
import React, { useState } from 'react';
import { AnnouncementHeader } from './AnnouncementHeader';
import { AnnouncementsList } from './AnnouncementsList';
import { AnnouncementFormDialog } from './AnnouncementFormDialog';
import { AnnouncementPreview } from './AnnouncementPreview';
import { useAnnouncementManagement } from '@/hooks/admin/announcements/useAnnouncementManagement';

export const AnnouncementManagement = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const {
    announcements,
    isLoading,
    editingAnnouncement,
    setEditingAnnouncement,
    previewAnnouncement,
    setPreviewAnnouncement,
    handleToggleActive,
    handleDelete,
    isToggling,
    isDeleting
  } = useAnnouncementManagement();

  if (isLoading) {
    return <div>Loading announcements...</div>;
  }

  return (
    <div className="space-y-6">
      <AnnouncementHeader onCreateNew={() => setIsCreateDialogOpen(true)} />

      <AnnouncementsList
        announcements={announcements || []}
        onEdit={setEditingAnnouncement}
        onPreview={setPreviewAnnouncement}
        onToggleActive={handleToggleActive}
        onDelete={handleDelete}
        isToggling={isToggling}
        isDeleting={isDeleting}
      />

      <AnnouncementFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        announcement={null}
      />

      <AnnouncementFormDialog
        open={!!editingAnnouncement}
        onOpenChange={(open) => !open && setEditingAnnouncement(null)}
        announcement={editingAnnouncement}
      />

      <AnnouncementPreview
        open={!!previewAnnouncement}
        onOpenChange={(open) => !open && setPreviewAnnouncement(null)}
        announcement={previewAnnouncement}
      />
    </div>
  );
};
