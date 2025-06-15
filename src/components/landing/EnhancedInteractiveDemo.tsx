
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  FileText, 
  HelpCircle, 
  Target, 
  ScanLine, 
  BarChart3, 
  ArrowRight,
  CheckCircle2,
  Clock,
  TrendingUp,
  Zap
} from "lucide-react";
import { Link } from "react-router-dom";

const enhancedDemoData = {
  subjects: {
    biology: {
      name: "Biology",
      color: "bg-green-100 text-green-700",
      note: {
        title: "Photosynthesis Process",
        content: "Photosynthesis is the process by which plants convert sunlight, carbon dioxide, and water into glucose and oxygen. This process occurs in the chloroplasts of plant cells and is essential for life on Earth.",
        enhanced: "6CO2 + 6H2O + light energy → C6H12O6 + 6O2\n\nKey stages:\n1. Light reactions (thylakoids)\n2. Calvin cycle (stroma)\n\nFactors affecting rate: light intensity, CO2 concentration, temperature"
      },
      flashcards: [
        { front: "What is the chemical equation for photosynthesis?", back: "6CO2 + 6H2O + light energy → C6H12O6 + 6O2" },
        { front: "Where do light reactions occur?", back: "In the thylakoids of chloroplasts" },
        { front: "What are the main products of photosynthesis?", back: "Glucose (C6H12O6) and oxygen (O2)" }
      ]
    },
    math: {
      name: "Mathematics", 
      color: "bg-blue-100 text-blue-700",
      note: {
        title: "Quadratic Equations",
        content: "A quadratic equation is a polynomial equation of degree 2. The standard form is ax² + bx + c = 0 where a ≠ 0.",
        enhanced: "Standard form: ax² + bx + c = 0\n\nQuadratic formula: x = (-b ± √(b²-4ac)) / 2a\n\nDiscriminant: Δ = b²-4ac\n• Δ > 0: two real solutions\n• Δ = 0: one real solution\n• Δ < 0: no real solutions"
      },
      flashcards: [
        { front: "What is the quadratic formula?", back: "x = (-b ± √(b²-4ac)) / 2a" },
        { front: "What does the discriminant tell us?", back: "The number and type of solutions: positive = 2 real, zero = 1 real, negative = no real solutions" },
        { front: "What is the standard form of a quadratic equation?", back: "ax² + bx + c = 0 where a ≠ 0" }
      ]
    },
    history: {
      name: "History",
      color: "bg-amber-100 text-amber-700", 
      note: {
        title: "World War II Timeline",
        content: "World War II was a global conflict that lasted from 1939 to 1945. It involved most of the world's nations and was the deadliest conflict in human history.",
        enhanced: "Key Events Timeline:\n• Sept 1, 1939: Germany invades Poland\n• Dec 7, 1941: Pearl Harbor attack\n• June 6, 1944: D-Day landings\n• Aug 6 & 9, 1945: Atomic bombs dropped\n• Sept 2, 1945: Japan surrenders\n\nMajor theaters: European, Pacific, African"
      },
      flashcards: [
        { front: "When did World War II begin and end?", back: "1939-1945 (September 1, 1939 to September 2, 1945)" },
        { front: "What event brought the US into WWII?", back: "The attack on Pearl Harbor (December 7, 1941)" },
        { front: "What was D-Day?", back: "The Allied invasion of Normandy, France on June 6, 1944" }
      ]
    }
  },
  features: {
    notes: {
      processing: ["Analyzing content structure...", "Enhancing with AI insights...", "Adding visual elements...", "Generating study aids..."],
      improvements: ["Added chemical equations", "Included process diagrams", "Enhanced with key factors", "Organized into clear sections"]
    },
    goals: {
      sample: {
        title: "Master Organic Chemistry",
        progress: 68,
        target: "Complete by Dec 15th",
        streak: 12,
        nextMilestone: "Functional Groups Quiz"
      }
    },
    scanning: {
      stages: ["Image processing...", "Text recognition...", "Content analysis...", "Note enhancement..."],
      accuracy: 94
    },
    analytics: {
      stats: {
        totalStudyTime: "47.5 hours",
        sessionsThisWeek: 12,
        averageScore: "87%",
        longestStreak: "15 days"
      },
      subjects: [
        { name: "Biology", progress: 85, time: "12.3h" },
        { name: "Chemistry", progress: 72, time: "18.7h" },
        { name: "Physics", progress: 63, time: "16.5h" }
      ]
    }
  }
};

export const EnhancedInteractiveDemo = () => {
  const [activeDemo, setActiveDemo] = useState<'notes' | 'flashcards' | 'quiz' | 'goals' | 'scanning' | 'analytics'>('notes');
  const [activeSubject, setActiveSubject] = useState<'biology' | 'math' | 'history'>('biology');
  const [currentCard, setCurrentCard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);

  const demos = [
    { id: 'notes', label: 'Smart Notes', icon: FileText },
    { id: 'flashcards', label: 'AI Flashcards', icon: Brain },
    { id: 'quiz', label: 'Adaptive Quiz', icon: HelpCircle },
    { id: 'goals', label: 'Study Goals', icon: Target },
    { id: 'scanning', label: 'Note Scanning', icon: ScanLine },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const currentSubject = enhancedDemoData.subjects[activeSubject];
  const quiz = {
    biology: { question: "Which organelle is responsible for photosynthesis?", options: ["Mitochondria", "Chloroplast", "Nucleus", "Ribosome"], correct: 1 },
    math: { question: "What is the discriminant of x² - 4x + 4 = 0?", options: ["16", "0", "-16", "8"], correct: 1 },
    history: { question: "Which year did WWII end?", options: ["1944", "1945", "1946", "1947"], correct: 1 }
  };

  const handleEnhanceNote = () => {
    setIsProcessing(true);
    setProcessingStep(0);
    
    const interval = setInterval(() => {
      setProcessingStep(prev => {
        if (prev >= 3) {
          clearInterval(interval);
          setIsProcessing(false);
          return prev;
        }
        return prev + 1;
      });
    }, 800);
  };

  const handleQuizAnswer = (index: number) => {
    setQuizAnswer(index);
    setTimeout(() => setShowResults(true), 500);
  };

  return (
    <div className="py-24 bg-gradient-to-b from-white to-mint-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-mint-100 rounded-full text-mint-700 text-sm mb-8">
            🎯 Interactive Demo - Try It Live!
          </div>
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Experience AI-powered learning in action
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            See how your study materials transform with intelligent AI assistance across different subjects
          </p>
        </div>

        {/* Subject Selector */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {Object.entries(enhancedDemoData.subjects).map(([key, subject]) => (
              <button
                key={key}
                onClick={() => {
                  setActiveSubject(key as any);
                  setCurrentCard(0);
                  setShowAnswer(false);
                  setQuizAnswer(null);
                  setShowResults(false);
                }}
                className={`px-4 py-2 rounded-md transition-all ${
                  activeSubject === key
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
          <div className="flex bg-gray-100 rounded-lg p-1 min-w-max">
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
        <div className="max-w-5xl mx-auto">
          {/* Smart Notes Demo */}
          {activeDemo === 'notes' && (
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-gray-600" />
                    Original Note
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">{currentSubject.note.title}</h3>
                    <p className="text-gray-700">{currentSubject.note.content}</p>
                    <Button onClick={handleEnhanceNote} disabled={isProcessing} className="w-full">
                      {isProcessing ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          {enhancedDemoData.features.notes.processing[processingStep]}
                        </div>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          Enhance with AI
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-mint-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-mint-600" />
                    AI Enhanced Note
                    <Badge variant="secondary" className="bg-mint-100 text-mint-700">
                      Enhanced
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">{currentSubject.note.title}</h3>
                    <div className="bg-mint-50 p-4 rounded-lg">
                      <pre className="text-mint-800 text-sm whitespace-pre-wrap font-medium">
                        {currentSubject.note.enhanced}
                      </pre>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-mint-600">
                      <CheckCircle2 className="h-4 w-4" />
                      Enhanced with formulas, structure, and key concepts
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* AI Flashcards Demo */}
          {activeDemo === 'flashcards' && (
            <Card className="border-mint-200 max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-mint-600" />
                  AI-Generated Flashcard
                  <Badge variant="secondary" className="bg-mint-100 text-mint-700">
                    Auto-Generated from {currentSubject.name}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white border-2 border-mint-200 rounded-xl p-8 min-h-[200px] flex flex-col justify-center items-center text-center">
                  <div className="space-y-4 w-full">
                    <div className="text-lg font-medium">
                      {showAnswer ? 
                        currentSubject.flashcards[currentCard].back : 
                        currentSubject.flashcards[currentCard].front
                      }
                    </div>
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
                    Card {currentCard + 1} of {currentSubject.flashcards.length}
                  </span>
                  <Button
                    onClick={() => {
                      setCurrentCard((currentCard + 1) % currentSubject.flashcards.length);
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

          {/* Adaptive Quiz Demo */}
          {activeDemo === 'quiz' && (
            <Card className="border-mint-200 max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-mint-600" />
                  Adaptive Quiz Question
                  <Badge variant="secondary" className="bg-mint-100 text-mint-700">
                    {currentSubject.name}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">{quiz[activeSubject].question}</h3>
                  <div className="space-y-2">
                    {quiz[activeSubject].options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuizAnswer(index)}
                        disabled={quizAnswer !== null}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          quizAnswer === null 
                            ? 'border-gray-200 hover:border-mint-300 hover:bg-mint-50'
                            : quizAnswer === index
                              ? index === quiz[activeSubject].correct
                                ? 'border-green-300 bg-green-50 text-green-800'
                                : 'border-red-300 bg-red-50 text-red-800'
                              : index === quiz[activeSubject].correct && showResults
                                ? 'border-green-300 bg-green-50 text-green-800'
                                : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        {String.fromCharCode(65 + index)}. {option}
                      </button>
                    ))}
                  </div>
                  {showResults && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-blue-800 text-sm">
                        {quizAnswer === quiz[activeSubject].correct 
                          ? "🎉 Correct! The AI will now show you harder questions to challenge your understanding."
                          : "💡 Not quite right. The AI will provide easier questions and explanations to help you learn."
                        }
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Study Goals Demo */}
          {activeDemo === 'goals' && (
            <Card className="border-mint-200 max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-mint-600" />
                  Smart Study Goals
                  <Badge variant="secondary" className="bg-mint-100 text-mint-700">
                    AI Tracked
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{enhancedDemoData.features.goals.sample.title}</h3>
                      <span className="text-2xl font-bold text-mint-600">{enhancedDemoData.features.goals.sample.progress}%</span>
                    </div>
                    <Progress value={enhancedDemoData.features.goals.sample.progress} className="mb-4" />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span>{enhancedDemoData.features.goals.sample.target}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span>{enhancedDemoData.features.goals.sample.streak} day streak</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-mint-50 p-4 rounded-lg">
                    <h4 className="font-medium text-mint-800 mb-2">Next Milestone</h4>
                    <p className="text-mint-700">{enhancedDemoData.features.goals.sample.nextMilestone}</p>
                    <Button size="sm" className="mt-3">Start Studying</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Note Scanning Demo */}
          {activeDemo === 'scanning' && (
            <Card className="border-mint-200 max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ScanLine className="h-5 w-5 text-mint-600" />
                  Smart Note Scanning
                  <Badge variant="secondary" className="bg-mint-100 text-mint-700">
                    OCR + AI
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <ScanLine className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">Upload handwritten notes or documents</p>
                    <Button variant="outline" className="mt-3">
                      Choose Files
                    </Button>
                  </div>
                  
                  <div className="bg-mint-50 p-4 rounded-lg">
                    <h4 className="font-medium text-mint-800 mb-3">Processing Pipeline:</h4>
                    <div className="space-y-2">
                      {enhancedDemoData.features.scanning.stages.map((stage, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-mint-700">{stage}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        {enhancedDemoData.features.scanning.accuracy}% Accuracy
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analytics Demo */}
          {activeDemo === 'analytics' && (
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-mint-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-mint-600" />
                    Learning Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-mint-600">{enhancedDemoData.features.analytics.stats.totalStudyTime}</div>
                      <div className="text-sm text-gray-600">Total Study Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{enhancedDemoData.features.analytics.stats.sessionsThisWeek}</div>
                      <div className="text-sm text-gray-600">Sessions This Week</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{enhancedDemoData.features.analytics.stats.averageScore}</div>
                      <div className="text-sm text-gray-600">Average Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{enhancedDemoData.features.analytics.stats.longestStreak}</div>
                      <div className="text-sm text-gray-600">Longest Streak</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-mint-200">
                <CardHeader>
                  <CardTitle>Subject Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {enhancedDemoData.features.analytics.subjects.map((subject, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">{subject.name}</span>
                          <span className="text-sm text-gray-600">{subject.time}</span>
                        </div>
                        <Progress value={subject.progress} className="h-2" />
                        <div className="text-xs text-gray-500 mt-1">{subject.progress}% complete</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button size="lg" className="bg-mint-600 hover:bg-mint-700">
            <Link to="/signup" className="flex items-center">
              Start Learning with AI
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <p className="mt-2 text-sm text-gray-500">
            Transform your study materials in under 2 minutes
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedInteractiveDemo;
