
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import StudyGroups from "./study-groups/StudyGroups";
import SharedWithMe from "./shared/SharedWithMe";
import MyShares from "./shared/MyShares";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const CollaborationHub = () => {
  const { userProfile, tierLimits, loading } = useRequireAuth();
  const [activeTab, setActiveTab] = useState("study-groups");
  
  // Show limited features for SCHOLAR tier
  const isCollaborationEnabled = tierLimits?.collaboration_enabled || false;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!isCollaborationEnabled && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Limited Collaboration Features</AlertTitle>
          <AlertDescription>
            Upgrade your account to unlock all collaboration features including study groups
            and real-time collaborative editing.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="study-groups">Study Groups</TabsTrigger>
          <TabsTrigger value="shared-with-me">Shared With Me</TabsTrigger>
          <TabsTrigger value="my-shares">My Shares</TabsTrigger>
        </TabsList>
        
        <TabsContent value="study-groups" className="space-y-4">
          <StudyGroups isEnabled={isCollaborationEnabled} />
        </TabsContent>
        
        <TabsContent value="shared-with-me" className="space-y-4">
          <SharedWithMe />
        </TabsContent>
        
        <TabsContent value="my-shares" className="space-y-4">
          <MyShares />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CollaborationHub;
