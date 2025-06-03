
import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Tag, Sparkles, ArrowRight } from "lucide-react";

interface EmptySubjectStateProps {
  subjectName: string;
  onCreateNote?: () => void;
}

export const EmptySubjectState = ({ subjectName, onCreateNote }: EmptySubjectStateProps) => {
  return (
    <div className="text-center py-20 px-6">
      <div className="max-w-md mx-auto">
        {/* Modern subject icon with enhanced design */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-mint-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl">
              <Tag className="h-10 w-10 text-white" />
            </div>
            
            {/* Floating accent */}
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>

        {/* Enhanced title and description */}
        <h3 className="text-2xl font-bold text-slate-800 mb-4">
          No notes in <span className="bg-gradient-to-r from-mint-600 to-blue-600 bg-clip-text text-transparent">{subjectName}</span>
        </h3>
        <p className="text-slate-600 mb-8 leading-relaxed">
          Start building your <strong>{subjectName}</strong> knowledge base by creating your first note in this subject.
        </p>

        {/* Enhanced action button */}
        {onCreateNote && (
          <Button 
            onClick={onCreateNote}
            className="bg-gradient-to-r from-mint-600 to-mint-700 hover:from-mint-700 hover:to-mint-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 group"
          >
            <div className="flex items-center gap-3">
              <Plus className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span>Add Note to {subjectName}</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Button>
        )}
        
        {/* Decorative elements */}
        <div className="mt-8 flex justify-center gap-2">
          <div className="w-2 h-2 bg-mint-300 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse delay-150"></div>
          <div className="w-2 h-2 bg-purple-300 rounded-full animate-pulse delay-300"></div>
        </div>
      </div>
    </div>
  );
};
