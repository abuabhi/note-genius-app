
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, FileText, HelpCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const demoData = {
  note: {
    title: "Photosynthesis Process",
    content: "Photosynthesis is the process by which plants convert sunlight, carbon dioxide, and water into glucose and oxygen..."
  },
  flashcards: [
    {
      front: "What is photosynthesis?",
      back: "The process by which plants convert sunlight, CO2, and water into glucose and oxygen"
    },
    {
      front: "What are the main inputs of photosynthesis?",
      back: "Sunlight, carbon dioxide (CO2), and water (H2O)"
    }
  ],
  quiz: {
    question: "Which of the following is NOT a product of photosynthesis?",
    options: ["Glucose", "Oxygen", "Carbon dioxide", "ATP"],
    correct: 2
  }
};

export const InteractiveDemo = () => {
  const [activeDemo, setActiveDemo] = useState<'note' | 'flashcard' | 'quiz'>('note');
  const [currentCard, setCurrentCard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const demos = [
    { id: 'note', label: 'Smart Notes', icon: FileText },
    { id: 'flashcard', label: 'AI Flashcards', icon: Brain },
    { id: 'quiz', label: 'Adaptive Quiz', icon: HelpCircle },
  ];

  return (
    <div className="py-24 bg-gradient-to-b from-white to-mint-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-mint-100 rounded-full text-mint-700 text-sm mb-8">
            🎯 Interactive Demo
          </div>
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Experience the power in action
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            See how your content transforms into powerful study materials with AI
          </p>
        </div>

        {/* Demo Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {demos.map((demo) => {
              const Icon = demo.icon;
              return (
                <button
                  key={demo.id}
                  onClick={() => setActiveDemo(demo.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                    activeDemo === demo.id
                      ? 'bg-white text-mint-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {demo.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Demo Content */}
        <div className="max-w-4xl mx-auto">
          {activeDemo === 'note' && (
            <Card className="border-mint-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-mint-600" />
                  Enhanced Note
                  <Badge variant="secondary" className="bg-mint-100 text-mint-700">
                    AI Enhanced
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">{demoData.note.title}</h3>
                  <p className="text-gray-700">{demoData.note.content}</p>
                  <div className="bg-mint-50 p-4 rounded-lg">
                    <h4 className="font-medium text-mint-800 mb-2">AI Summary:</h4>
                    <p className="text-mint-700 text-sm">
                      Key process converting light energy to chemical energy in plants through chloroplasts...
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeDemo === 'flashcard' && (
            <Card className="border-mint-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-mint-600" />
                  AI-Generated Flashcard
                  <Badge variant="secondary" className="bg-mint-100 text-mint-700">
                    Auto-Generated
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white border-2 border-mint-200 rounded-xl p-8 min-h-[200px] flex flex-col justify-center items-center text-center">
                  <div className="space-y-4 w-full">
                    <p className="text-lg font-medium">
                      {showAnswer ? demoData.flashcards[currentCard].back : demoData.flashcards[currentCard].front}
                    </p>
                    <Button
                      onClick={() => setShowAnswer(!showAnswer)}
                      variant="outline"
                      className="border-mint-300"
                    >
                      {showAnswer ? 'Show Question' : 'Show Answer'}
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm text-gray-500">Card {currentCard + 1} of {demoData.flashcards.length}</span>
                  <Button
                    onClick={() => {
                      setCurrentCard((currentCard + 1) % demoData.flashcards.length);
                      setShowAnswer(false);
                    }}
                    size="sm"
                  >
                    Next Card
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeDemo === 'quiz' && (
            <Card className="border-mint-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-mint-600" />
                  Adaptive Quiz Question
                  <Badge variant="secondary" className="bg-mint-100 text-mint-700">
                    AI Generated
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">{demoData.quiz.question}</h3>
                  <div className="space-y-2">
                    {demoData.quiz.options.map((option, index) => (
                      <button
                        key={index}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          index === demoData.quiz.correct
                            ? 'border-green-300 bg-green-50'
                            : 'border-gray-200 hover:border-mint-300 hover:bg-mint-50'
                        }`}
                      >
                        {String.fromCharCode(65 + index)}. {option}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button size="lg" className="bg-mint-600 hover:bg-mint-700">
            <Link to="/signup" className="flex items-center">
              Try It Yourself
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <p className="mt-2 text-sm text-gray-500">
            Create your first AI-powered study set in under 2 minutes
          </p>
        </div>
      </div>
    </div>
  );
};

export default InteractiveDemo;
