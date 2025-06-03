
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  BookOpen, 
  FileText, 
  Camera, 
  Import, 
  Pin, 
  Search,
  ArrowRight,
  Sparkles,
  Zap,
  Star
} from "lucide-react";

interface WelcomeOnboardingProps {
  onCreateNote?: () => void;
  onScanNote?: () => void;
  onImportNote?: () => void;
  onDismiss?: () => void;
}

export const WelcomeOnboarding = ({ 
  onCreateNote, 
  onScanNote, 
  onImportNote,
  onDismiss 
}: WelcomeOnboardingProps) => {
  return (
    <Card className="relative overflow-hidden border-0 shadow-2xl">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-mint-500/10 via-blue-500/5 to-purple-500/10 animate-pulse" />
      <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm" />
      
      {/* Floating elements for visual interest */}
      <div className="absolute top-4 right-4 w-12 h-12 bg-mint-200/30 rounded-full animate-bounce delay-1000" />
      <div className="absolute top-12 right-20 w-6 h-6 bg-blue-200/30 rounded-full animate-pulse delay-500" />
      
      <CardContent className="relative p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-mint-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="h-8 w-8 text-white animate-pulse" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <Star className="h-3 w-3 text-yellow-800" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-mint-700 to-blue-700 bg-clip-text text-transparent">
                Welcome to Your Notes!
              </h3>
              <p className="text-slate-600 font-medium">Let's get you started with organizing your knowledge</p>
            </div>
          </div>
          {onDismiss && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onDismiss}
              className="text-slate-400 hover:text-slate-600 hover:bg-white/50 rounded-full w-8 h-8 p-0"
            >
              ×
            </Button>
          )}
        </div>

        {/* Enhanced Quick Actions with modern design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {onCreateNote && (
            <Button 
              onClick={onCreateNote}
              variant="outline"
              className="h-auto p-6 flex flex-col items-center space-y-3 border-2 border-mint-200/50 hover:border-mint-400 bg-white/80 hover:bg-mint-50/80 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl group hover:scale-105"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-mint-500 to-mint-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <span className="font-semibold text-slate-800">Create Note</span>
              <span className="text-xs text-slate-500 text-center">Start writing your ideas</span>
            </Button>
          )}
          
          {onScanNote && (
            <Button 
              onClick={onScanNote}
              variant="outline"
              className="h-auto p-6 flex flex-col items-center space-y-3 border-2 border-blue-200/50 hover:border-blue-400 bg-white/80 hover:bg-blue-50/80 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl group hover:scale-105"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Camera className="h-6 w-6 text-white" />
              </div>
              <span className="font-semibold text-slate-800">Scan Document</span>
              <span className="text-xs text-slate-500 text-center">Upload & digitize images</span>
            </Button>
          )}
          
          {onImportNote && (
            <Button 
              onClick={onImportNote}
              variant="outline"
              className="h-auto p-6 flex flex-col items-center space-y-3 border-2 border-purple-200/50 hover:border-purple-400 bg-white/80 hover:bg-purple-50/80 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl group hover:scale-105"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Import className="h-6 w-6 text-white" />
              </div>
              <span className="font-semibold text-slate-800">Import File</span>
              <span className="text-xs text-slate-500 text-center">PDF, DOCX & more</span>
            </Button>
          )}
        </div>

        {/* Enhanced Feature Highlights with modern cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-3 p-4 bg-white/60 rounded-xl border border-mint-100/50 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-mint-100 rounded-xl flex items-center justify-center">
              <Pin className="h-5 w-5 text-mint-600" />
            </div>
            <div>
              <span className="font-medium text-slate-800">Pin Important Notes</span>
              <p className="text-xs text-slate-500 mt-1">Keep them at the top</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-white/60 rounded-xl border border-blue-100/50 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Search className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <span className="font-medium text-slate-800">Smart Search</span>
              <p className="text-xs text-slate-500 mt-1">Find anything instantly</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-white/60 rounded-xl border border-purple-100/50 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <span className="font-medium text-slate-800">Study Mode</span>
              <p className="text-xs text-slate-500 mt-1">Convert to flashcards</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
