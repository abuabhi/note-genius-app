
import React, { useState } from "react";
import { UserTier } from "@/hooks/useRequireAuth";
import { User, InfluencerMetadata } from "./types";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, RotateCcw, Check, Star, Crown, UserCheck } from "lucide-react";
import { InfluencerPromotionDialog } from "./InfluencerPromotionDialog";

interface UserTableRowProps {
  user: User;
  updateUserTier: (userId: string, newTier: UserTier) => Promise<void>;
  updateOnboardingStatus: (userId: string, completed: boolean) => Promise<void>;
  promoteToInfluencer: (userId: string, tier: 'GRADUATE' | 'MASTER', metadata: InfluencerMetadata, expirationMonths: number, notes?: string) => Promise<void>;
  revokeInfluencer: (userId: string, reason?: string) => Promise<void>;
}

const UserTableRow: React.FC<UserTableRowProps> = ({ 
  user, 
  updateUserTier, 
  updateOnboardingStatus,
  promoteToInfluencer,
  revokeInfluencer
}) => {
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  return (
    <TableRow key={user.id}>
      <TableCell>{user.email}</TableCell>
      <TableCell>{user.username}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
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
          {user.is_influencer && (
            <Crown className="h-4 w-4 text-yellow-500" />
          )}
        </div>
      </TableCell>
      <TableCell>
        {user.is_influencer ? (
          <div className="space-y-1">
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white flex items-center gap-1">
              <Star className="h-3 w-3" />
              {user.influencer_tier} Influencer
            </Badge>
            {user.influencer_expires_at && (
              <p className="text-xs text-muted-foreground">
                Expires: {new Date(user.influencer_expires_at).toLocaleDateString()}
              </p>
            )}
          </div>
        ) : (
          <Badge variant="outline" className="text-muted-foreground">
            Regular User
          </Badge>
        )}
      </TableCell>
      <TableCell>
        <Badge 
          variant={user.onboarding_completed ? "default" : "secondary"}
          className={`flex items-center gap-1 ${
            user.onboarding_completed 
              ? 'bg-green-100 text-green-800 border-green-200' 
              : 'bg-orange-100 text-orange-800 border-orange-200'
          }`}
        >
          {user.onboarding_completed ? (
            <>
              <CheckCircle className="h-3 w-3" />
              Complete
            </>
          ) : (
            <>
              <XCircle className="h-3 w-3" />
              Pending
            </>
          )}
        </Badge>
      </TableCell>
      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2 flex-wrap">
          {!user.is_influencer && (
            <Select 
              value={user.user_tier}
              onValueChange={(value) => updateUserTier(user.id, value as UserTier)}
            >
              <SelectTrigger className="w-[110px]">
                <SelectValue placeholder="Select tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UserTier.SCHOLAR}>Scholar</SelectItem>
                <SelectItem value={UserTier.GRADUATE}>Graduate</SelectItem>
                <SelectItem value={UserTier.MASTER}>Master</SelectItem>
                <SelectItem value={UserTier.DEAN}>Dean</SelectItem>
              </SelectContent>
            </Select>
          )}
          
          {user.onboarding_completed ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateOnboardingStatus(user.id, false)}
              className="h-8 px-2"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateOnboardingStatus(user.id, true)}
              className="h-8 px-2"
            >
              <Check className="h-3 w-3 mr-1" />
              Complete
            </Button>
          )}

          {user.user_tier === UserTier.SCHOLAR && !user.is_influencer && (
            <Button
              size="sm"
              onClick={() => setShowPromotionDialog(true)}
              className="h-8 px-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
            >
              <UserCheck className="h-3 w-3 mr-1" />
              Make Influencer
            </Button>
          )}

          {user.is_influencer && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => revokeInfluencer(user.id, "Manual revocation")}
              className="h-8 px-2"
            >
              <XCircle className="h-3 w-3 mr-1" />
              Revoke
            </Button>
          )}
        </div>

        <InfluencerPromotionDialog
          user={user}
          open={showPromotionDialog}
          onClose={() => setShowPromotionDialog(false)}
          onPromote={promoteToInfluencer}
        />
      </TableCell>
    </TableRow>
  );
};

export default UserTableRow;
