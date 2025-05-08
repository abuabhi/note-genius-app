
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile, UserTier } from "@/hooks/useRequireAuth";
import { Search, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface User {
  id: string;
  email: string;
  username?: string;
  user_tier: UserTier;
  created_at: string;
}

const UserTierManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // First get auth users
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) throw authError;
      
      // Then get profiles for user_tier info
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
        
      if (profilesError) throw profilesError;
      
      // Join the data
      const userData = authUsers.users.map(authUser => {
        const profile = profiles.find(p => p.id === authUser.id);
        return {
          id: authUser.id,
          email: authUser.email || '',
          username: profile?.username || authUser.email?.split('@')[0] || '',
          user_tier: profile?.user_tier || UserTier.SCHOLAR,
          created_at: authUser.created_at,
        };
      });
      
      setUsers(userData);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error fetching users",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserTier = async (userId: string, newTier: UserTier) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ user_tier: newTier })
        .eq('id', userId);
      
      if (error) throw error;
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, user_tier: newTier } : user
      ));
      
      toast({
        title: "User tier updated",
        description: "The user's tier has been successfully updated.",
      });
    } catch (error) {
      console.error("Error updating user tier:", error);
      toast({
        title: "Error updating user tier",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user => {
    // Filter by search term
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by tier
    const matchesTier = filter === "all" || user.user_tier === filter;
    
    return matchesSearch && matchesTier;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-[250px]" />
          <Skeleton className="h-10 w-[150px]" />
        </div>
        <Skeleton className="h-[500px] w-full rounded-md" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email or username"
            className="pl-8 w-full sm:w-[300px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value={UserTier.SCHOLAR}>Scholar</SelectItem>
              <SelectItem value={UserTier.GRADUATE}>Graduate</SelectItem>
              <SelectItem value={UserTier.MASTER}>Master</SelectItem>
              <SelectItem value={UserTier.DEAN}>Dean</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableCaption>Manage user tiers for your application users.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Current Tier</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[200px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      user.user_tier === UserTier.DEAN 
                        ? 'bg-purple-100 text-purple-800' 
                        : user.user_tier === UserTier.MASTER 
                        ? 'bg-green-100 text-green-800'
                        : user.user_tier === UserTier.GRADUATE 
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.user_tier}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Select 
                      value={user.user_tier}
                      onValueChange={(value) => updateUserTier(user.id, value as UserTier)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Select tier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={UserTier.SCHOLAR}>Scholar</SelectItem>
                        <SelectItem value={UserTier.GRADUATE}>Graduate</SelectItem>
                        <SelectItem value={UserTier.MASTER}>Master</SelectItem>
                        <SelectItem value={UserTier.DEAN}>Dean</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  No users found matching your search criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end">
        <Button onClick={fetchUsers}>Refresh Users</Button>
      </div>
    </div>
  );
};

export default UserTierManagement;
