
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { PlusCircle, UserPlus, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import CreateStudyGroupDialog from "./CreateStudyGroupDialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StudyGroup {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  is_public: boolean;
  created_at: string;
  member_count: number;
  is_owner: boolean;
  is_member: boolean;
}

interface StudyGroupsProps {
  isEnabled: boolean;
}

const StudyGroups = ({ isEnabled }: StudyGroupsProps) => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Fetch user's study groups and public groups
  useEffect(() => {
    const fetchGroups = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Get all public groups and groups the user is a member of
        const { data: studyGroups, error } = await supabase
          .from('study_groups')
          .select(`
            id,
            name,
            description,
            owner_id,
            is_public,
            created_at
          `)
          .or(`is_public.eq.true, id.in(${getStudyGroupMembershipSubquery()})`)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Get member counts for each group
        const groupsWithMemberCounts = await Promise.all(
          studyGroups.map(async (group) => {
            const { count, error: countError } = await supabase
              .from('study_group_members')
              .select('*', { count: 'exact', head: true })
              .eq('group_id', group.id);

            if (countError) console.error('Error getting member count:', countError);

            // Check if user is a member or owner
            const { data: membership } = await supabase
              .from('study_group_members')
              .select('role')
              .eq('group_id', group.id)
              .eq('user_id', user.id)
              .single();

            return {
              ...group,
              member_count: count || 0,
              is_owner: group.owner_id === user.id,
              is_member: !!membership
            };
          })
        );

        setGroups(groupsWithMemberCounts);
      } catch (error) {
        console.error('Error fetching study groups:', error);
        toast.error('Failed to load study groups');
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [user]);

  // Helper function to create a subquery for groups where the user is a member
  const getStudyGroupMembershipSubquery = () => {
    if (!user) return '';
    return `SELECT group_id FROM study_group_members WHERE user_id = '${user.id}'`;
  };

  const handleCreateGroup = async (newGroup: { name: string; description: string; isPublic: boolean }) => {
    if (!user) return;
    
    try {
      // First, create the study group
      const { data: groupData, error: groupError } = await supabase
        .from('study_groups')
        .insert({
          name: newGroup.name,
          description: newGroup.description,
          is_public: newGroup.isPublic,
          owner_id: user.id
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Then, add the creator as an owner member
      const { error: memberError } = await supabase
        .from('study_group_members')
        .insert({
          group_id: groupData.id,
          user_id: user.id,
          role: 'owner'
        });

      if (memberError) throw memberError;

      toast.success('Study group created successfully');
      setShowCreateDialog(false);
      
      // Add the new group to the list
      const newGroupWithData = {
        ...groupData,
        member_count: 1,
        is_owner: true,
        is_member: true
      };
      
      setGroups(prev => [newGroupWithData, ...prev]);
      
    } catch (error) {
      console.error('Error creating study group:', error);
      toast.error('Failed to create study group');
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    if (!user) return;
    
    try {
      // Add user as a member
      const { error } = await supabase
        .from('study_group_members')
        .insert({
          group_id: groupId,
          user_id: user.id,
          role: 'member'
        });

      if (error) throw error;

      toast.success('Successfully joined the study group');
      
      // Update the groups data
      setGroups(prev => 
        prev.map(group => 
          group.id === groupId
            ? { ...group, is_member: true, member_count: group.member_count + 1 }
            : group
        )
      );
      
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error('Failed to join the study group');
    }
  };

  if (!isEnabled) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Users className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Collaboration Features Locked</h3>
        <p className="text-muted-foreground mb-6">
          Upgrade your account to access study groups and other collaboration features.
        </p>
        <Button>Upgrade Now</Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Study Groups</h2>
        <Button onClick={() => setShowCreateDialog(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Study Group
        </Button>
      </div>

      {groups.length === 0 ? (
        <Card className="text-center p-6">
          <CardContent className="pt-6 flex flex-col items-center">
            <Users className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Study Groups Found</h3>
            <p className="text-muted-foreground mb-6">
              Create your first study group or join an existing one to start collaborating.
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Study Group
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <Card key={group.id}>
              <CardHeader>
                <div className="flex justify-between">
                  <div className="space-y-1">
                    <CardTitle>{group.name}</CardTitle>
                    <CardDescription>
                      {group.is_public ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Public</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Private</Badge>
                      )}
                    </CardDescription>
                  </div>
                  <Badge className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {group.member_count}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-24">
                  <p className="text-sm text-muted-foreground">
                    {group.description || "No description provided."}
                  </p>
                </ScrollArea>
              </CardContent>
              <CardFooter>
                {!group.is_member ? (
                  <Button 
                    onClick={() => handleJoinGroup(group.id)}
                    className="w-full"
                    variant="secondary"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Join Group
                  </Button>
                ) : (
                  <Button 
                    onClick={() => console.log('View group details')}
                    className="w-full"
                  >
                    View Group
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <CreateStudyGroupDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
        onCreate={handleCreateGroup}
      />
    </div>
  );
};

export default StudyGroups;
