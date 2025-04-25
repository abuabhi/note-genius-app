
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, Share, Group } from "lucide-react";
import { Button } from "@/components/ui/button";

const CollaborationHub = () => {
  const collaborationData = {
    activeStudyGroups: 3,
    sharedResources: 12,
    teamMembers: 5,
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Stats Cards */}
        <Card className="border-mint-100 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-mint-700">Study Groups</CardTitle>
            <Group className="h-4 w-4 text-mint-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-mint-800">{collaborationData.activeStudyGroups}</p>
            <p className="text-xs text-mint-600">Active study groups</p>
          </CardContent>
        </Card>

        <Card className="border-mint-100 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-mint-700">Shared Resources</CardTitle>
            <Share className="h-4 w-4 text-mint-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-mint-800">{collaborationData.sharedResources}</p>
            <p className="text-xs text-mint-600">Materials shared</p>
          </CardContent>
        </Card>

        <Card className="border-mint-100 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-mint-700">Team Members</CardTitle>
            <Users className="h-4 w-4 text-mint-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-mint-800">{collaborationData.teamMembers}</p>
            <p className="text-xs text-mint-600">Active participants</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-mint-100 bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Create or Join a Study Group</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button className="w-full sm:w-auto bg-mint-600 hover:bg-mint-700">
            <Group className="mr-2 h-4 w-4" />
            Create New Group
          </Button>
          <Button variant="outline" className="w-full sm:w-auto border-mint-200 hover:bg-mint-50">
            <Users className="mr-2 h-4 w-4" />
            Browse Groups
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CollaborationHub;
