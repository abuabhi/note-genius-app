
import React from 'react';
import { HelpSearch } from '@/components/help/HelpSearch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Video, MessageCircle, FileText } from 'lucide-react';
import { useHelp } from '@/contexts/HelpContext';

const HelpPage = () => {
  const { openHelp } = useHelp();

  const helpCategories = [
    {
      title: 'Getting Started',
      icon: BookOpen,
      description: 'Learn the basics of using PrepGenie',
      topics: ['Creating your first note', 'Setting up flashcards', 'Taking your first quiz']
    },
    {
      title: 'Video Tutorials',
      icon: Video,
      description: 'Watch step-by-step video guides',
      topics: ['Dashboard overview', 'Study techniques', 'Advanced features']
    },
    {
      title: 'Study Features',
      icon: FileText,
      description: 'Master all study tools',
      topics: ['Note organization', 'Flashcard creation', 'Quiz strategies']
    },
    {
      title: 'Support',
      icon: MessageCircle,
      description: 'Get help when you need it',
      topics: ['Contact support', 'Report bugs', 'Feature requests']
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Help Center</h1>
        <p className="text-lg text-gray-600 mb-6">
          Find answers, learn new features, and get the most out of PrepGenie
        </p>
        <HelpSearch />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {helpCategories.map((category, index) => {
          const IconComponent = category.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-mint-100 rounded-lg">
                    <IconComponent className="h-6 w-6 text-mint-600" />
                  </div>
                  {category.title}
                </CardTitle>
                <p className="text-gray-600">{category.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {category.topics.map((topic, topicIndex) => (
                    <li key={topicIndex}>
                      <button
                        onClick={() => openHelp()}
                        className="text-mint-600 hover:text-mint-700 hover:underline text-left"
                      >
                        {topic}
                      </button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-12 bg-mint-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <BookOpen className="h-8 w-8 text-mint-600 mx-auto mb-2" />
            <h3 className="font-medium mb-1">Start with Notes</h3>
            <p className="text-sm text-gray-600">Create and organize your study materials</p>
          </div>
          <div className="text-center">
            <FileText className="h-8 w-8 text-mint-600 mx-auto mb-2" />
            <h3 className="font-medium mb-1">Convert to Flashcards</h3>
            <p className="text-sm text-gray-600">Turn your notes into study cards</p>
          </div>
          <div className="text-center">
            <Video className="h-8 w-8 text-mint-600 mx-auto mb-2" />
            <h3 className="font-medium mb-1">Track Progress</h3>
            <p className="text-sm text-gray-600">Monitor your learning journey</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
