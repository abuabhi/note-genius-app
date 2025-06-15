
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  FileText, 
  HelpCircle, 
  ArrowRight, 
  Target, 
  Camera, 
  BarChart3, 
  Users,
  Clock,
  CheckCircle,
  Star,
  Zap,
  TrendingUp,
  BookOpen
} from "lucide-react";
import { Link } from "react-router-dom";

const enhancedDemoData = {
  subjects: {
    science: {
      name: "Biology",
      note: {
        title: "Photosynthesis Process",
        content: "Photosynthesis is the process by which plants convert sunlight, carbon dioxide, and water into glucose and oxygen. This occurs in chloroplasts containing chlorophyll.",
        enhanced: "Key process converting light energy to chemical energy through: Light Reactions → Calvin Cycle → Glucose Production"
      },
      flashcards: [
        { front: "What is photosynthesis?", back: "The process by which plants convert sunlight, CO2, and water into glucose and oxygen" },
        { front: "Where does photosynthesis occur?", back: "In chloroplasts containing chlorophyll" }
      ],
      quiz: {
        question: "Which of the following is NOT a product of photosynthesis?",
        options: ["Glucose", "Oxygen", "Carbon dioxide", "ATP"],
        correct: 2
      }
    },
    math: {
      name: "Mathematics",
      note: {
        title: "Quadratic Formula",
        content: "The quadratic formula is x = (-b ± √(b²-4ac)) / 2a. It's used to solve equations of the form ax² + bx + c = 0.",
        enhanced: "Step-by-step approach: 1) Identify a, b, c coefficients 2) Calculate discriminant (b²-4ac) 3) Apply formula"
      },
      flashcards: [
        { front: "What is the quadratic formula?", back: "x = (-b ± √(b²-4ac)) / 2a" },
        { front: "What does the discriminant tell us?", back: "The number and type of solutions (b²-4ac)" }
      ],
      quiz: {
        question: "For the equation 2x² + 5x - 3 = 0, what is the value of 'a'?",
        options: ["2", "5", "-3", "0"],
        correct: 0
      }
    },
    history: {
      name: "History",
      note: {
        title: "World War II Timeline",
        content: "WWII began in 1939 with Germany's invasion of Poland and ended in 1945. Key events include Pearl Harbor (1941), D-Day (1944), and atomic bombs (1945).",
        enhanced: "Critical turning points: 1939 invasion → 1941 global expansion → 1943 tide turns → 1945 Allied victory"
      },
      flashcards: [
        { front: "When did WWII begin and end?", back: "1939-1945 (6 years)" },
        { front: "What event brought the US into WWII?", back: "Pearl Harbor attack (December 7, 1941)" }
      ],
      quiz: {
        question: "Which event marked the beginning of WWII?",
        options: ["Pearl Harbor", "D-Day", "Invasion of Poland", "Battle of Britain"],
        correct: 2
      }
    }
  },
  features: {
    goals: {
      title: "Study Goals",
      current: "Master Calculus Fundamentals",
      progress: 75,
      target: "20 hours",
      deadline: "Dec 31, 2024",
      streak: 12
    },
    scan: {
      title: "Note Scanning",
      confidence: 94,
      recognized: "The mitochondria is the powerhouse of the cell...",
      enhanced: "Enhanced with AI: Added molecular diagrams and ATP synthesis explanation"
    },
    analytics: {
      title: "Learning Analytics",
      sessions: 28,
      hours: 42,
      improvement: "+23%",
      subjects: ["Math", "Science", "History"]
    },
    collaboration: {
      title: "Study Groups",
      members: 4,
      shared: 15,
      groupName: "Calculus Study Circle"
    }
  }
};

export const EnhancedInteractiveDemo = () => {
  const [activeDemo, setActiveDemo] = useState<'note' | 'flashcard' | 'quiz' | 'goals' | 'scan' | 'analytics' | 'collaboration'>('note');
  const [activeSubject, setActiveSubject] = useState<'science' | 'math' | 'history'>('science');
  const [currentCard, setCurrentCard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quizProgress, setQuizProgress] = useState(0);

  const demos = [
    { id: 'note', label: 'Smart Notes', icon: FileText, color: 'text-blue-600' },
    { id: 'flashcard', label: 'AI Flashcards', icon: Brain, color: 'text-purple-600' },
    { id: 'quiz', label: 'Adaptive Quiz', icon: HelpCircle, color: 'text-green-600' },
    { id: 'goals', label: 'Study Goals', icon: Target, color: 'text-orange-600' },
    { id: 'scan', label: 'Note Scanning', icon: Camera, color: 'text-pink-600' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'text-indigo-600' },
    { id: 'collaboration', label: 'Collaboration', icon: Users, color: 'text-teal-600' },
  ];

  const subjects = [
    { id: 'science', name: 'Biology', color: 'bg-green-100 text-green-700' },
    { id: 'math', name: 'Mathematics', color: 'bg-blue-100 text-blue-700' },
    { id: 'history', name: 'History', color: 'bg-purple-100 text-purple-700' },
  ];

  const currentSubjectData = enhancedDemoData.subjects[activeSubject];

  const simulateProcessing = () => {
    setIsProcessing(true);
    setTimeout(() => setIsProcessing(false), 2000);
  };

  const handleQuizAnswer = (optionIndex: number) => {
    const isCorrect = optionIndex === currentSubjectData.quiz.correct;
    setQuizProgress(isCorrect ? 100 : 50);
    setTimeout(() => setQuizProgress(0), 3000);
  };

  return (
    <div className="py-24 bg-gradient-to-b from-white to-mint-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-mint-100 rounded-full text-mint-700 text-sm mb-8">
            🎯 Enhanced Interactive Demo
          </div>
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Experience AI-powered learning in action
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Explore how your content transforms into powerful study materials across different subjects
          </p>
        </div>

        {/* Subject Selector */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setActiveSubject(subject.id as any)}
                className={`px-4 py-2 rounded-md transition-all ${
                  activeSubject === subject.id
                    ? `${subject.color} shadow-sm`
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {subject.name}
              </button>
            ))}
          </div>
        </div>

        {/* Demo Navigation */}
        <div className="flex justify-center mb-8 overflow-x-auto">
          <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
            {demos.map((demo) => {
              const Icon = demo.icon;
              return (
                <button
                  key={demo.id}
                  onClick={() => setActiveDemo(demo.id as any)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all whitespace-nowrap ${
                    activeDemo === demo.id
                      ? 'bg-white text-mint-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${activeDemo === demo.id ? 'text-mint-600' : demo.color}`} />
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
                  Enhanced Note - {currentSubjectData.name}
                  <Badge variant="secondary" className="bg-mint-100 text-mint-700">
                    AI Enhanced
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">{currentSubjectData.note.title}</h3>
                  <p className="text-gray-700">{currentSubjectData.note.content}</p>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={simulateProcessing}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-mint-600 border-t-transparent rounded-full mr-2" />
                          Enhancing...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          Enhance with AI
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="bg-mint-50 p-4 rounded-lg">
                    <h4 className="font-medium text-mint-800 mb-2 flex items-center">
                      <Star className="h-4 w-4 mr-2" />
                      AI Enhancement:
                    </h4>
                    <p className="text-mint-700 text-sm">
                      {currentSubjectData.note.enhanced}
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
                  AI-Generated Flashcard - {currentSubjectData.name}
                  <Badge variant="secondary" className="bg-mint-100 text-mint-700">
                    Auto-Generated
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white border-2 border-mint-200 rounded-xl p-8 min-h-[200px] flex flex-col justify-center items-center text-center">
                  <div className="space-y-4 w-full">
                    <p className="text-lg font-medium">
                      {showAnswer 
                        ? currentSubjectData.flashcards[currentCard].back 
                        : currentSubjectData.flashcards[currentCard].front}
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
                  <span className="text-sm text-gray-500">
                    Card {currentCard + 1} of {currentSubjectData.flashcards.length}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setCurrentCard((currentCard + 1) % currentSubjectData.flashcards.length);
                        setShowAnswer(false);
                      }}
                      size="sm"
                    >
                      Next Card
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeDemo === 'quiz' && (
            <Card className="border-mint-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-mint-600" />
                  Adaptive Quiz - {currentSubjectData.name}
                  <Badge variant="secondary" className="bg-mint-100 text-mint-700">
                    AI Generated
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {quizProgress > 0 && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <Progress value={quizProgress} className="mb-2" />
                      <p className="text-sm text-green-700">
                        {quizProgress === 100 ? "Correct! Great job!" : "Good attempt! Review the material."}
                      </p>
                    </div>
                  )}
                  
                  <h3 className="font-semibold text-lg">{currentSubjectData.quiz.question}</h3>
                  <div className="space-y-2">
                    {currentSubjectData.quiz.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuizAnswer(index)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          quizProgress > 0 && index === currentSubjectData.quiz.correct
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

          {activeDemo === 'goals' && (
            <Card className="border-mint-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-mint-600" />
                  Study Goals Tracking
                  <Badge variant="secondary" className="bg-mint-100 text-mint-700">
                    Progress Tracking
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{enhancedDemoData.features.goals.current}</h3>
                    <Progress value={enhancedDemoData.features.goals.progress} className="mb-2" />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{enhancedDemoData.features.goals.progress}% Complete</span>
                      <span>Target: {enhancedDemoData.features.goals.target}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-800">Deadline</span>
                      </div>
                      <p className="text-orange-700">{enhancedDemoData.features.goals.deadline}</p>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Study Streak</span>
                      </div>
                      <p className="text-green-700">{enhancedDemoData.features.goals.streak} days</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeDemo === 'scan' && (
            <Card className="border-mint-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-mint-600" />
                  Note Scanning & OCR
                  <Badge variant="secondary" className="bg-mint-100 text-mint-700">
                    {enhancedDemoData.features.scan.confidence}% Accuracy
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-center">
                      <Camera className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-600">Scanned handwritten note</p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Recognized Text:</h4>
                    <p className="text-blue-700 text-sm">{enhancedDemoData.features.scan.recognized}</p>
                  </div>
                  
                  <div className="bg-mint-50 p-4 rounded-lg">
                    <h4 className="font-medium text-mint-800 mb-2">AI Enhancement:</h4>
                    <p className="text-mint-700 text-sm">{enhancedDemoData.features.scan.enhanced}</p>
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
                    Performance Insights
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-700">{enhancedDemoData.features.analytics.sessions}</div>
                    <div className="text-sm text-blue-600">Study Sessions</div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-700">{enhancedDemoData.features.analytics.hours}h</div>
                    <div className="text-sm text-green-600">Total Study Time</div>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-700">{enhancedDemoData.features.analytics.improvement}</div>
                    <div className="text-sm text-purple-600">Improvement</div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Subject Performance</h4>
                  <div className="space-y-2">
                    {enhancedDemoData.features.analytics.subjects.map((subject, index) => (
                      <div key={subject} className="flex items-center justify-between">
                        <span className="text-sm">{subject}</span>
                        <Progress value={85 - index * 10} className="w-32" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeDemo === 'collaboration' && (
            <Card className="border-mint-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-mint-600" />
                  Study Collaboration
                  <Badge variant="secondary" className="bg-mint-100 text-mint-700">
                    Social Learning
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-teal-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-teal-800 mb-2">{enhancedDemoData.features.collaboration.groupName}</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-teal-600">Members: </span>
                        <span className="font-medium">{enhancedDemoData.features.collaboration.members}</span>
                      </div>
                      <div>
                        <span className="text-teal-600">Shared Sets: </span>
                        <span className="font-medium">{enhancedDemoData.features.collaboration.shared}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-8 h-8 bg-gradient-to-r from-mint-400 to-blue-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-medium">
                          {String.fromCharCode(64 + i)}
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-sm font-medium">Active study session</p>
                      <p className="text-xs text-gray-600">4 members online now</p>
                    </div>
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
              Start Your AI-Powered Learning Journey
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <p className="mt-2 text-sm text-gray-500">
            Create your account and experience all features in under 2 minutes
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedInteractiveDemo;
