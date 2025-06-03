
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface QuickActionCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  buttonText: string;
  variant?: "default" | "outline" | "ghost";
  secondaryAction?: {
    href: string;
    icon: LucideIcon;
    text: string;
  };
}

export const QuickActionCard = ({
  title,
  description,
  href,
  icon: Icon,
  buttonText,
  variant = "outline",
  secondaryAction
}: QuickActionCardProps) => {
  return (
    <Card className="border-mint-100 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Button asChild variant={variant} className="w-full">
            <Link to={href}>
              <Icon className="mr-2 h-4 w-4" />
              {buttonText}
            </Link>
          </Button>
          {secondaryAction && (
            <Button asChild variant="ghost" size="sm" className="w-full">
              <Link to={secondaryAction.href}>
                <secondaryAction.icon className="mr-2 h-4 w-4" />
                {secondaryAction.text}
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
