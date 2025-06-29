
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, FileText, HelpCircle, ArrowRight, LayoutDashboard, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

const demoData = {
  smartNotes: {
    before: {
      title: "My Biology Notes - Photosynthesis",
      content: "photosynthesis is when plants make food from sunlight. they use co2 and water. makes glucose and oxygen. happens in chloroplasts. light reactions and calvin cycle are the two parts. need chlorophyll."
    },
    after: {
      title: "Enhanced Biology Notes - Photosynthesis",
      content: "**Photosynthesis Process Overview**\n\n**Definition:** The biological process where plants convert light energy into chemical energy (glucose)\n\n**Key Inputs:**\n• Sunlight (light energy)\n• Carbon dioxide (CO₂)\n• Water (H₂O)\n\n**Products:**\n• Glucose (C₆H₁₂O₆) - energy storage\n• Oxygen (O₂) - released as byproduct\n\n**Location:** Chloroplasts (contains chlorophyll)\n\n**Two Main Stages:**\n1. **Light Reactions** - Convert light to chemical energy\n2. **Calvin Cycle** - Use chemical energy to make glucose",
      summary: "Photosynthesis converts sunlight, CO₂, and water into glucose and oxygen through light reactions and the Calvin cycle in chloroplasts.",
      keyPoints: ["Energy conversion: Light → Chemical", "Occurs in chloroplasts", "Two-stage process", "Essential for plant survival"]
    }
  },
  dashboard: {
    stats: {
      studyStreak: 15,
      completedSets: 8,
      accuracyRate: 87,
      weeklyGoal: 12
    },
    recentActivity: [
      "Completed Biology flashcards",
      "Generated quiz from Chemistry notes",
      "Updated study plan schedule"
    ]
  },
  studyPlan: {
    title: "HSC Biology Preparation",
    timeline: "6 weeks remaining",
    progress: 68,
    todaysTasks: [
      "Review Photosynthesis flashcards (30 min)",
      "Complete Cellular Respiration practice quiz",
      "Read Chapter 5: Genetics (45 min)"
    ]
  },
  flashcard: {
    front: "What is the overall equation for photosynthesis?",
    back: "6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂ + ATP",
    difficulty: "Medium",
    mastery: "Learning"
  },
  quiz: {
    question: "Which organelle is responsible for photosynthesis in plant cells?",
    options: ["Mitochondria", "Chloroplast", "Nucleus", "Ribosome"],
    correct: 1,
    explanation: "Chloroplasts contain chlorophyll and are the site where photosynthesis occurs in plant cells."
  }
};

export const EnhancedInteractiveDemo = () => {
  const [activeDemo, setActiveDemo] = useState<'smartNotes' | 'dashboard' | 'studyPlan' | 'flashcard' | 'quiz'>('smartNotes');

  const demos = [
    { id: 'smartNotes', label: 'Smart Notes', icon: FileText, highlight: 'AI Enhanced' },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, highlight: 'Real-time' },
    { id: 'studyPlan', label: 'Study Plans', icon: Calendar, highlight: 'Personalized' },
    { id: 'flashcard', label: 'AI Flashcards', icon: Brain, highlight: 'Auto-generated' },
    { id: 'quiz', label: 'Adaptive Quiz', icon: HelpCircle, highlight: 'Smart' },
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

        {/* Simplified Demo Navigation */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-gray-100 rounded-xl p-1 gap-1 flex-wrap justify-center">
            {demos.map((demo) => {
              const Icon = demo.icon;
              return (
                <button
                  key={demo.id}
                  onClick={() => setActiveDemo(demo.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all text-sm font-medium ${
                    activeDemo === demo.id
                      ? 'bg-white text-mint-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{demo.label}</span>
                  <span className="sm:hidden">{demo.label.split(' ')[0]}</span>
                  {demo.highlight && (
                    <Badge variant="secondary" className="bg-mint-100 text-mint-700 text-xs ml-1">
                      {demo.highlight}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Demo Content */}
        <div className="max-w-6xl mx-auto">
          {activeDemo === 'smartNotes' && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Before - Raw Notes */}
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-700">
                    <FileText className="h-5 w-5" />
                    Before AI Enhancement
                    <Badge variant="outline" className="text-xs">Raw Notes</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">{demoData.smartNotes.before.title}</h3>
                    <div className="bg-gray-50 p-4 rounded-lg min-h-[200px]">
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {demoData.smartNotes.before.content}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500 italic">
                      Unstructured, missing key details, hard to study from
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* After - Enhanced Notes */}
              <Card className="border-mint-200 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-mint-700">
                    <Brain className="h-5 w-5" />
                    After AI Enhancement
                    <Badge className="bg-mint-100 text-mint-700 text-xs">AI Enhanced</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">{demoData.smartNotes.after.title}</h3>
                    <div className="bg-mint-50 p-4 rounded-lg min-h-[200px]">
                      <div className="prose prose-sm text-gray-700">
                        {demoData.smartNotes.after.content.split('\n').map((line, index) => (
                          <div key={index} className="mb-1">
                            {line.startsWith('**') ? (
                              <div className="font-semibold text-mint-800">{line.replace(/\*\*/g, '')}</div>
                            ) : line.startsWith('•') ? (
                              <div className="ml-4 text-sm">{line}</div>
                            ) : line.startsWith('1.') || line.startsWith('2.') ? (
                              <div className="ml-2 text-sm font-medium text-mint-700">{line}</div>
                            ) : (
                              <div className="text-sm">{line}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-mint-100 p-3 rounded-lg">
                      <h4 className="font-medium text-mint-800 mb-2 text-sm">AI Summary:</h4>
                      <p className="text-mint-700 text-sm">{demoData.smartNotes.after.summary}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeDemo === 'dashboard' && (
            <Card className="border-mint-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LayoutDashboard className="h-5 w-5 text-mint-600" />
                  Study Dashboard
                  <Badge className="bg-mint-100 text-mint-700 text-xs">Real-time</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-mint-50 to-mint-100 p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-mint-700">{demoData.dashboard.stats.studyStreak}</div>
                    <div className="text-sm text-mint-600">Day Streak</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-blue-700">{demoData.dashboard.stats.completedSets}</div>
                    <div className="text-sm text-blue-600">Sets Completed</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-green-700">{demoData.dashboard.stats.accuracyRate}%</div>
                    <div className="text-sm text-green-600">Accuracy</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-purple-700">{demoData.dashboard.stats.weeklyGoal}/12</div>
                    <div className="text-sm text-purple-600">Weekly Goal</div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-3">Recent Activity</h4>
                  <div className="space-y-2">
                    {demoData.dashboard.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-mint-500 rounded-full"></div>
                        {activity}
                      </div>
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
                  <Badge className="bg-mint-100 text-mint-700 text-xs">AI Generated</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-lg">{demoData.studyPlan.title}</h3>
                      <p className="text-sm text-gray-600">{demoData.studyPlan.timeline}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-mint-600">{demoData.studyPlan.progress}%</div>
                      <div className="text-sm text-gray-500">Complete</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-mint-500 to-mint-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${demoData.studyPlan.progress}%` }}
                    ></div>
                  </div>
                  <div className="bg-mint-50 p-4 rounded-lg">
                    <h4 className="font-medium text-mint-800 mb-3">Today's Tasks</h4>
                    <div className="space-y-2">
                      {demoData.studyPlan.todaysTasks.map((task, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <input type="checkbox" className="rounded border-mint-300 text-mint-600" />
                          <span className="text-sm text-gray-700">{task}</span>
                        </div>
                      ))}
                    </div>
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
                  <Badge className="bg-mint-100 text-mint-700 text-xs">Auto-generated</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white border-2 border-mint-200 rounded-xl p-8 min-h-[250px] flex flex-col justify-center items-center text-center mb-4">
                  <div className="space-y-6 w-full">
                    <div className="space-y-4">
                      <div className="text-sm text-mint-600 font-medium">Question</div>
                      <p className="text-lg font-medium text-gray-900">{demoData.flashcard.front}</p>
                    </div>
                    <div className="border-t border-gray-200 pt-4 space-y-4">
                      <div className="text-sm text-mint-600 font-medium">Answer</div>
                      <p className="text-lg text-gray-700">{demoData.flashcard.back}</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex gap-4">
                    <span className="text-gray-500">Difficulty: <span className="font-medium text-orange-600">{demoData.flashcard.difficulty}</span></span>
                    <span className="text-gray-500">Status: <span className="font-medium text-blue-600">{demoData.flashcard.mastery}</span></span>
                  </div>
                  <Button size="sm" className="bg-mint-600 hover:bg-mint-700">
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
                  <Badge className="bg-mint-100 text-mint-700 text-xs">AI Generated</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <h3 className="font-semibold text-lg">{demoData.quiz.question}</h3>
                  <div className="space-y-3">
                    {demoData.quiz.options.map((option, index) => (
                      <button
                        key={index}
                        className={`w-full text-left p-4 rounded-lg border transition-colors ${
                          index === demoData.quiz.correct
                            ? 'border-green-300 bg-green-50 text-green-800'
                            : 'border-gray-200 hover:border-mint-300 hover:bg-mint-50'
                        }`}
                      >
                        <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
                        {index === demoData.quiz.correct && (
                          <span className="ml-2 text-green-600 text-sm">✓ Correct</span>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="bg-mint-50 p-4 rounded-lg">
                    <h4 className="font-medium text-mint-800 mb-2">Explanation:</h4>
                    <p className="text-mint-700 text-sm">{demoData.quiz.explanation}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button size="lg" className="bg-mint-600 hover:bg-mint-700" asChild>
            <Link to="/signup">
              Try It Yourself
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <p className="mt-4 text-sm text-gray-500">
            Create your first AI-powered study set in under 2 minutes • No credit card required
          </p>
          <div className="mt-4">
            <Button variant="outline" size="sm" asChild>
              <Link to="/features">
                Explore All Features
                <ArrowRight className="ml-2 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedInteractiveDemo;
