
import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Lightbulb, BookOpen, Camera, Sparkles, Zap, ArrowRight } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

interface EmptyNotesStateProps {
  onCreateNote?: () => void;
  onScanNote?: () => void;
  onImportNote?: () => void;
  isFiltered?: boolean;
}

export const EmptyNotesState = ({ 
  onCreateNote, 
  onScanNote, 
  onImportNote,
  isFiltered = false 
}: EmptyNotesStateProps) => {
  if (isFiltered) {
    return (
      <div className="text-center py-20 px-6">
        <div className="max-w-md mx-auto">
          {/* Modern empty search state */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center shadow-lg">
                <FileText className="h-10 w-10 text-slate-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Zap className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-slate-700 mb-3">
            No matching notes found
          </h3>
          <p className="text-slate-500 leading-relaxed">
            Try adjusting your search terms or filters to discover your content.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-20 px-6">
      <div className="max-w-lg mx-auto">
        {/* Enhanced main illustration */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {/* Main circle with gradient */}
            <div className="w-24 h-24 bg-gradient-to-br from-mint-400 to-blue-500 rounded-3xl flex items-center justify-center shadow-2xl">
              <BookOpen className="h-12 w-12 text-white" />
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            
            <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <Plus className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>

        {/* Enhanced title and description */}
        <h3 className="text-3xl font-bold bg-gradient-to-r from-mint-700 to-blue-700 bg-clip-text text-transparent mb-4">
          Start Your Learning Journey
        </h3>
        <p className="text-slate-600 mb-10 leading-relaxed text-lg">
          Create your first note to begin organizing your knowledge. Choose from multiple ways to get started.
        </p>

        {/* Enhanced action buttons with modern design */}
        <div className="space-y-4 mb-10">
          {onCreateNote && (
            <Button 
              onClick={onCreateNote}
              className="w-full bg-gradient-to-r from-mint-600 to-mint-700 hover:from-mint-700 hover:to-mint-800 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 group"
            >
              <div className="flex items-center justify-center gap-3">
                <FileText className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>Create Your First Note</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Button>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            {onScanNote && (
              <Button 
                onClick={onScanNote}
                variant="outline"
                className="border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 font-semibold py-3 px-4 rounded-xl transition-all duration-300 group"
              >
                <Camera className="mr-2 h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
                Scan Document
              </Button>
            )}
            
            {onImportNote && (
              <Button 
                onClick={onImportNote}
                variant="outline"
                className="border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 font-semibold py-3 px-4 rounded-xl transition-all duration-300 group"
              >
                <Plus className="mr-2 h-5 w-5 text-purple-600 group-hover:scale-110 transition-transform" />
                Import File
              </Button>
            )}
          </div>
        </div>

        {/* Enhanced tips section with modern card design */}
        <div className="bg-gradient-to-br from-mint-50/80 to-blue-50/60 backdrop-blur-sm rounded-2xl p-6 border border-mint-100/50 shadow-lg">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-mint-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Lightbulb className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-slate-800 mb-3 text-lg">Pro Tips to Get Started:</h4>
              <ul className="text-sm text-slate-600 space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-mint-500 rounded-full"></div>
                  Use subjects to organize notes by topic
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Pin important notes for quick access
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Convert notes to flashcards for studying
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
