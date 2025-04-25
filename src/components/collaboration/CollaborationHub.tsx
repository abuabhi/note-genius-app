import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, Share, Group } from "lucide-react";
import { Button } from "@/components/ui/button";

const CollaborationHub = () => {
  // Mock data - in a real app, this would come from an API
  const collaborationData = {
    activeStudyGroups: 3,
    sharedResources: 12,
    teamMembers: 5,
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Study Groups</CardTitle>
            {Group({ className: "h-4 w-4 text-muted-foreground" })}
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{collaborationData.activeStudyGroups}</p>
            <p className="text-xs text-muted-foreground">Active study groups</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Shared Resources</CardTitle>
            {Share({ className: "h-4 w-4 text-muted-foreground" })}
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{collaborationData.sharedResources}</p>
            <p className="text-xs text-muted-foreground">Materials shared</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            {Users({ className: "h-4 w-4 text-muted-foreground" })}
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{collaborationData.teamMembers}</p>
            <p className="text-xs text-muted-foreground">Active participants</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create or Join a Study Group</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button className="w-full sm:w-auto">
            {Group({ className: "mr-2 h-4 w-4" })}
            Create New Group
          </Button>
          <Button variant="outline" className="w-full sm:w-auto">
            {Users({ className: "mr-2 h-4 w-4" })}
            Browse Groups
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CollaborationHub;
