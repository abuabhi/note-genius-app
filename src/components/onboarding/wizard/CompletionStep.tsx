
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, BookOpen, Target, Bell } from "lucide-react";

interface CompletionStepProps {
  onFinish: () => void;
}

export const CompletionStep = ({ onFinish }: CompletionStepProps) => {
  const quickActions = [
    {
      title: "Create Your First Note",
      description: "Start building your knowledge base",
      icon: BookOpen,
      color: "bg-blue-500"
    },
    {
      title: "Set Study Goals",
      description: "Plan your learning journey",
      icon: Target,
      color: "bg-green-500"
    },
    {
      title: "Explore Features",
      description: "Discover what PrepGenie can do",
      icon: Bell,
      color: "bg-purple-500"
    }
  ];

  return (
    <div className="space-y-8 text-center">
      <div>
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
          Welcome to PrepGenie!
        </h2>
        <p className="text-lg text-slate-600 max-w-md mx-auto mb-2">
          Your account is ready! You're all set to start your learning journey.
        </p>
        <p className="text-sm text-slate-500">
          Here are some things you can do next:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions.map((action, index) => {
          const IconComponent = action.icon;
          return (
            <div key={index} className="p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                <IconComponent className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-slate-800 text-sm mb-1">{action.title}</h3>
              <p className="text-xs text-slate-600">{action.description}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-gradient-to-r from-mint-50 to-blue-50 rounded-xl p-6 border border-mint-100">
        <p className="text-sm text-slate-600 mb-4">
          🎉 <strong>Pro tip:</strong> Start by creating your first note or exploring the flashcard feature!
        </p>
        <Button
          onClick={onFinish}
          className="bg-gradient-to-r from-mint-600 to-blue-600 hover:from-mint-700 hover:to-blue-700 text-white px-8"
        >
          Go to Dashboard
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
