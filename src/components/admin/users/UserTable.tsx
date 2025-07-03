
import React from "react";
import { UserTier } from "@/hooks/useRequireAuth";
import { User } from "./types";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import UserTableRow from "./UserTableRow";

interface UserTableProps {
  users: User[];
  updateUserTier: (userId: string, newTier: UserTier) => Promise<void>;
  updateOnboardingStatus: (userId: string, completed: boolean) => Promise<void>;
  promoteToInfluencer: (userId: string, tier: 'GRADUATE' | 'MASTER', metadata: any, expirationMonths: number, notes?: string) => Promise<void>;
  revokeInfluencer: (userId: string, reason?: string) => Promise<void>;
}

const UserTable: React.FC<UserTableProps> = ({ 
  users, 
  updateUserTier, 
  updateOnboardingStatus, 
  promoteToInfluencer, 
  revokeInfluencer 
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableCaption>Manage user tiers and onboarding status for your application users.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Current Tier</TableHead>
            <TableHead>Influencer</TableHead>
            <TableHead>Onboarding</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[300px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length > 0 ? (
            users.map((user) => (
              <UserTableRow 
                key={user.id}
                user={user} 
                updateUserTier={updateUserTier}
                updateOnboardingStatus={updateOnboardingStatus}
                promoteToInfluencer={promoteToInfluencer}
                revokeInfluencer={revokeInfluencer}
              />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                No users found matching your search criteria.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;
