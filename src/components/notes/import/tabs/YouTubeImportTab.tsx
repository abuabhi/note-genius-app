
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Youtube, Clock, Sparkles, Video, FileText, Zap } from 'lucide-react';

interface YouTubeImportTabProps {
  onImport: (noteData: any) => void;
}

export const YouTubeImportTab = ({ onImport }: YouTubeImportTabProps) => {
  return (
    <div className="space-y-8 animate-fade-in">
      <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-500 hover:scale-[1.01] animate-scale-in group">
        <CardHeader className="text-center pb-6 relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg animate-pulse group-hover:animate-bounce">
              <Youtube className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              YouTube Import
            </CardTitle>
            <div className="h-1 w-20 bg-gradient-to-r from-red-500 to-red-300 rounded-full mx-auto mt-3 animate-fade-in" />
            <p className="text-gray-600 text-base mt-4 leading-relaxed">
              Import video transcripts and turn them into structured notes
            </p>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center space-y-8">
            {/* Coming Soon Badge */}
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 px-6 py-4 rounded-2xl shadow-lg border border-amber-200/50 animate-pulse">
              <Clock className="h-6 w-6" />
              <span className="font-bold text-lg">Coming Soon</span>
            </div>
            
            <p className="text-gray-600 text-lg leading-relaxed max-w-md mx-auto">
              We're working on bringing YouTube video transcription to your note-taking experience.
            </p>
            
            {/* Features Preview */}
            <div className="bg-gradient-to-br from-gray-50 to-mint-50/30 rounded-2xl p-8 text-left shadow-inner border border-gray-200/50">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="h-6 w-6 text-mint-500" />
                <h4 className="text-xl font-bold text-gray-800">What's Coming:</h4>
              </div>
              
              <div className="grid gap-4">
                {[
                  { icon: Video, text: "Import transcripts from YouTube videos" },
                  { icon: Sparkles, text: "Automatic content enhancement and formatting" },
                  { icon: FileText, text: "Smart categorization and tagging" },
                  { icon: Zap, text: "Integration with our automation workflow" }
                ].map((feature, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-4 p-4 bg-white/80 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] animate-fade-in"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className="p-2 bg-gradient-to-br from-mint-500 to-mint-600 rounded-lg shadow-md">
                      <feature.icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-gray-500 text-sm bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50">
              Stay tuned for updates! This feature will be available soon.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
