
import React from "react";
import { UserTier } from "@/hooks/useRequireAuth";
import { User } from "./types";
import { TableCell, TableRow } from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserTableRowProps {
  user: User;
  updateUserTier: (userId: string, newTier: UserTier) => Promise<void>;
}

const UserTableRow: React.FC<UserTableRowProps> = ({ user, updateUserTier }) => {
  return (
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
  );
};

export default UserTableRow;
