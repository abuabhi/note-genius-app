
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, Star } from "lucide-react";
import { useUserTier } from "@/hooks/useUserTier";
import { Link } from "react-router-dom";
import { UserTier } from "@/hooks/useRequireAuth";

// Updated color scheme using mint colors from the theme
const tierColors = {
  [UserTier.SCHOLAR]: "bg-mint-400",
  [UserTier.GRADUATE]: "bg-mint-500",
  [UserTier.MASTER]: "bg-mint-600",
  [UserTier.DEAN]: "bg-mint-700",
};

// Tier feature information
const tierFeatures = {
  [UserTier.SCHOLAR]: [
    "Basic flashcards",
    "Study tracking",
    "Note taking",
    "Basic progress tracking"
  ],
  [UserTier.GRADUATE]: [
    "All Scholar features",
    "Explanations and hints",
    "Export/Import functionality",
    "Quiz explanations"
  ],
  [UserTier.MASTER]: [
    "All Graduate features",
    "AI flashcard generation",
    "Advanced analytics",
    "Priority support"
  ],
  [UserTier.DEAN]: [
    "All Master features",
    "Calendar integration",
    "Smart scheduling",
    "Collaborative features",
    "Unlimited sets"
  ]
};

export const UpgradeTierCard = () => {
  const { userTier, isUserPremium } = useUserTier();
  
  // Determine if user is at max tier
  const isMaxTier = userTier === UserTier.DEAN;
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Your Subscription</CardTitle>
            <CardDescription>Manage your subscription plan</CardDescription>
          </div>
          <Badge 
            className={`${userTier && tierColors[userTier]} text-white`}
          >
            {userTier || "SCHOLAR"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current tier features */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Your current plan includes:</h3>
          <ul className="space-y-1">
            {userTier && tierFeatures[userTier]?.map((feature, index) => (
              <li key={index} className="text-sm flex items-center gap-2">
                <Check className="h-4 w-4 text-mint-600" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
        
        {/* Upgrade section */}
        {isMaxTier ? (
          <Alert className="bg-mint-50 border-mint-200">
            <Star className="h-4 w-4 text-mint-700" />
            <AlertDescription className="text-mint-700">
              You're on the highest tier! Enjoy all premium features.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-mint-600" />
              <p className="text-sm">Upgrade your plan to unlock more features</p>
            </div>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
              <Button asChild variant="default" className="bg-mint-600 hover:bg-mint-700">
                <Link to="/pricing">View Plans</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/pricing">Compare Features</Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
