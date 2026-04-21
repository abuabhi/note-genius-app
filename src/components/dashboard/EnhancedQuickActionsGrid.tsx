
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  BookOpen, 
  GraduationCap, 
  FileText
} from "lucide-react";
import { useDashboardCounts } from "@/hooks/useDashboardCounts";

interface QuickActionCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<any>;
  variant?: "default" | "outline" | "ghost";
  badge?: string;
  gradient?: boolean;
}

const QuickActionCard = ({ 
  title, 
  description, 
  href, 
  icon: Icon, 
  variant = "outline",
  badge,
  gradient = false
}: QuickActionCardProps) => (
  <Card className={`hover:shadow-md transition-all duration-200 group ${gradient ? 'bg-gradient-to-br from-mint-50 to-blue-50 border-mint-200' : 'hover:scale-105'}`}>
    <CardContent className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${gradient ? 'bg-white/60' : 'bg-mint-50'} group-hover:scale-110 transition-transform`}>
          <Icon className={`h-6 w-6 ${gradient ? 'text-mint-600' : 'text-mint-500'}`} />
        </div>
        {badge && (
          <Badge variant="secondary" className="text-xs">
            {badge}
          </Badge>
        )}
      </div>
      
      <div className="space-y-3">
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
        
        <Button asChild variant={variant} className="w-full group-hover:bg-mint-500 group-hover:text-white transition-colors">
          <Link to={href}>
            Get Started
          </Link>
        </Button>
      </div>
    </CardContent>
  </Card>
);

export const EnhancedQuickActionsGrid = () => {
  // Single RPC instead of 4 round-trips
  const { data: counts = { flashcardSets: 0, notes: 0, quizzes: 0, activeGoals: 0 } } = useDashboardCounts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-mint-900">Quick Actions</h2>
      </div>

      {/* Primary Actions - Study Tools */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <QuickActionCard
          title="Study Flashcards"
          description="Review and master your flashcard collections"
          href="/flashcards"
          icon={BookOpen}
          variant="default"
          badge={counts.flashcardSets > 0 ? `${counts.flashcardSets} sets` : "Start here"}
          gradient={true}
        />

        <QuickActionCard
          title="Take a Quiz"
          description="Test your knowledge with interactive quizzes"
          href="/quizzes"
          icon={GraduationCap}
          badge={counts.quizzes > 0 ? `${counts.quizzes} available` : "New"}
        />

        <QuickActionCard
          title="My Notes"
          description="Access and organize your study materials"
          href="/notes"
          icon={FileText}
          badge={counts.notes > 0 ? `${counts.notes} notes` : "Create first"}
        />
      </div>
    </div>
  );
};
