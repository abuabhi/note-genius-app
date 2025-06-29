
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, FileText, HelpCircle, Calendar, BarChart3, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const demoData = {
  note: {
    title: "Cell Biology - Mitosis Process",
    content: "Mitosis is the process of cell division that results in two genetically identical diploid cells from a single diploid cell..."
  },
  flashcards: [
    {
      front: "What are the main phases of mitosis?",
      back: "Prophase, Metaphase, Anaphase, and Telophase (PMAT)"
    },
    {
      front: "What happens during prophase?",
      back: "Nuclear envelope breaks down, chromosomes condense, and spindle fibers form"
    }
  ],
  quiz: {
    question: "During which phase of mitosis do chromosomes align at the cell's equator?",
    options: ["Prophase", "Metaphase", "Anaphase", "Telophase"],
    correct: 1
  },
  studyPlan: {
    title: "AP Biology Final Exam Prep",
    sessions: [
      { topic: "Cell Biology Review", duration: "45 min", status: "completed" },
      { topic: "Genetics Practice", duration: "60 min", status: "active" },
      { topic: "Evolution Concepts", duration: "30 min", status: "upcoming" }
    ]
  },
  analytics: {
    totalTime: "28 hours",
    streak: "12 days",
    improvement: "+23%",
    weakAreas: ["Genetics", "Molecular Biology"]
  }
};

export const EnhancedInteractiveDemo = () => {
  const [activeDemo, setActiveDemo] = useState<'note' | 'flashcard' | 'quiz' | 'studyPlan' | 'analytics'>('note');
  const [currentCard, setCurrentCard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const demos = [
    { id: 'note', label: 'Smart Notes', icon: FileText },
    { id: 'flashcard', label: 'AI Flashcards', icon: Brain },
    { id: 'quiz', label: 'Adaptive Quiz', icon: HelpCircle },
    { id: 'studyPlan', label: 'Study Plans', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
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
            See how your content transforms into powerful study materials with AI-powered tools and personalized learning
          </p>
        </div>

        {/* Demo Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-gray-100 rounded-lg p-1 overflow-x-auto">
            {demos.map((demo) => {
              const Icon = demo.icon;
              return (
                <button
                  key={demo.id}
                  onClick={() => setActiveDemo(demo.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all whitespace-nowrap ${
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
                      Mitosis produces two identical diploid cells through four distinct phases: PMAT (Prophase, Metaphase, Anaphase, Telophase)
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Key Concepts:</h4>
                    <ul className="text-blue-700 text-sm space-y-1">
                      <li>• Cell division process</li>
                      <li>• Four distinct phases</li>
                      <li>• Results in genetic duplication</li>
                    </ul>
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

          {activeDemo === 'studyPlan' && (
            <Card className="border-mint-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-mint-600" />
                  Personalized Study Plan
                  <Badge variant="secondary" className="bg-mint-100 text-mint-700">
                    Smart Scheduling
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">{demoData.studyPlan.title}</h3>
                  <div className="space-y-3">
                    {demoData.studyPlan.sessions.map((session, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            session.status === 'completed' ? 'bg-green-500' :
                            session.status === 'active' ? 'bg-mint-500' : 'bg-gray-300'
                          }`} />
                          <span className="font-medium">{session.topic}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{session.duration}</span>
                          <Badge variant={
                            session.status === 'completed' ? 'secondary' :
                            session.status === 'active' ? 'default' : 'outline'
                          }>
                            {session.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeDemo === 'analytics' && (
            <Card className="border-mint-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-mint-600" />
                  Learning Analytics
                  <Badge variant="secondary" className="bg-mint-100 text-mint-700">
                    Progress Tracking
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-mint-50 rounded-lg">
                    <div className="text-2xl font-bold text-mint-600">{demoData.analytics.totalTime}</div>
                    <div className="text-sm text-gray-600">Study Time</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{demoData.analytics.streak}</div>
                    <div className="text-sm text-gray-600">Study Streak</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{demoData.analytics.improvement}</div>
                    <div className="text-sm text-gray-600">Improvement</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">2</div>
                    <div className="text-sm text-gray-600">Focus Areas</div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">Areas to Focus On:</h4>
                  <div className="flex flex-wrap gap-2">
                    {demoData.analytics.weakAreas.map((area, index) => (
                      <Badge key={index} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button size="lg" className="bg-mint-600 hover:bg-mint-700 shadow-lg hover:shadow-xl transition-all duration-200">
            <Link to="/signup" className="flex items-center">
              Try It Yourself - It's Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <p className="mt-2 text-sm text-gray-500">
            Create your first AI-powered study materials in under 2 minutes
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedInteractiveDemo;
