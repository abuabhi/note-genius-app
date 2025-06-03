
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
  Sparkles
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
    <Card className="mb-8 border-mint-200 bg-gradient-to-r from-mint-50 to-blue-50">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-mint-100 rounded-full flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-mint-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Welcome to Your Notes!</h3>
              <p className="text-sm text-gray-600">Let's get you started with organizing your knowledge</p>
            </div>
          </div>
          {onDismiss && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onDismiss}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </Button>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {onCreateNote && (
            <Button 
              onClick={onCreateNote}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 border-mint-200 hover:bg-mint-50"
            >
              <FileText className="h-6 w-6 text-mint-600" />
              <span className="font-medium">Create Note</span>
              <span className="text-xs text-gray-500">Start writing</span>
            </Button>
          )}
          
          {onScanNote && (
            <Button 
              onClick={onScanNote}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 border-blue-200 hover:bg-blue-50"
            >
              <Camera className="h-6 w-6 text-blue-600" />
              <span className="font-medium">Scan Document</span>
              <span className="text-xs text-gray-500">Upload image</span>
            </Button>
          )}
          
          {onImportNote && (
            <Button 
              onClick={onImportNote}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 border-purple-200 hover:bg-purple-50"
            >
              <Import className="h-6 w-6 text-purple-600" />
              <span className="font-medium">Import File</span>
              <span className="text-xs text-gray-500">PDF, DOCX, etc.</span>
            </Button>
          )}
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2 text-gray-600">
            <Pin className="h-4 w-4 text-mint-500" />
            <span>Pin important notes</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Search className="h-4 w-4 text-mint-500" />
            <span>Search across all notes</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <BookOpen className="h-4 w-4 text-mint-500" />
            <span>Convert to flashcards</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
