
import React from 'react';
import { Calendar, BookOpen, Target } from 'lucide-react';

export const StudyPlannerHeader = () => {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center mb-4">
        <div className="bg-mint-100 p-3 rounded-full">
          <Calendar className="h-8 w-8 text-mint-600" />
        </div>
      </div>
      
      <h1 className="text-4xl font-bold text-gray-900 mb-2">
        Study Planner
      </h1>
      
      <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
        Create personalized study schedules, track your progress, and achieve your learning goals with intelligent planning.
      </p>
      
      <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
        <div className="flex items-center">
          <BookOpen className="h-4 w-4 mr-2 text-mint-600" />
          <span>Smart Scheduling</span>
        </div>
        <div className="flex items-center">
          <Target className="h-4 w-4 mr-2 text-blue-600" />
          <span>Goal Integration</span>
        </div>
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-2 text-purple-600" />
          <span>Progress Tracking</span>
        </div>
      </div>
    </div>
  );
};
