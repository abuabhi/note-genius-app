
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, FileText, HelpCircle, ArrowRight, LayoutDashboard, CheckSquare, Target, Calendar, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const demoData = {
  smartNotes: {
    before: {
      title: "Photosynthesis - Biology Notes",
      content: "photosynthesis is when plants make food from sunlight. they use co2 and water. makes oxygen too. happens in chloroplasts. light reactions and dark reactions. ATP and NADPH made in light reactions."
    },
    after: {
      title: "Photosynthesis - Enhanced Biology Notes",
      content: "Photosynthesis is the fundamental biological process by which plants convert light energy into chemical energy.",
      summary: "Photosynthesis converts light energy to chemical energy through two main stages: light-dependent reactions (producing ATP and NADPH) and light-independent reactions (Calvin cycle).",
      keyPoints: [
        "Occurs in chloroplasts of plant cells",
        "Requires sunlight, CO₂, and H₂O as inputs",
        "Produces glucose (C₆H₁₂O₆) and oxygen as outputs",
        "Two main stages: Light reactions and Calvin cycle"
      ],
      studyTips: "Focus on understanding the connection between light and dark reactions - they're interdependent processes."
    }
  },
  dashboard: {
    stats: {
      studyStreak: 12,
      completionRate: 87,
      activeGoals: 4,
      pendingTasks: 6
    },
    recentActivity: [
      "Completed Chemistry Quiz - Acids & Bases",
      "Reviewed Biology Flashcards - Cell Division", 
      "Updated Study Plan for Math Finals"
    ],
    upcomingTasks: [
      "Physics Assignment Due Tomorrow",
      "History Essay - First Draft",
      "Review Calculus Practice Problems"
    ]
  },
  todos: {
    categories: ["Assignments", "Study Sessions", "Exams"],
    tasks: [
      { title: "Complete Chemistry Lab Report", priority: "High", due: "Tomorrow", category: "Assignments" },
      { title: "Review Biology Chapter 12", priority: "Medium", due: "This Week", category: "Study Sessions" },
      { title: "Math Final Exam Prep", priority: "High", due: "Next Week", category: "Exams" }
    ]
  },
  goals: {
    activeGoals: [
      { title: "Improve Math Grade to A-", progress: 75, target: "End of Semester" },
      { title: "Complete SAT Prep Course", progress: 45, target: "Next Month" },
      { title: "Master Chemistry Concepts", progress: 60, target: "Before Finals" }
    ]
  },
  studyPlan: {
    todayPlan: [
      { time: "9:00 AM", subject: "Mathematics", task: "Algebra Practice", duration: "45 min" },
      { time: "2:00 PM", subject: "Biology", task: "Cell Division Review", duration: "30 min" },
      { time: "7:00 PM", subject: "Chemistry", task: "Acids & Bases Quiz", duration: "25 min" }
    ],
    weeklyGoals: [
      "Complete 3 Math practice tests",
      "Review all Biology chapters 10-12",
      "Finish Chemistry project presentation"
    ]
  },
  flashcard: {
    front: "What is photosynthesis?",
    back: "The process by which plants convert sunlight, CO₂, and water into glucose and oxygen using chloroplasts"
  },
  quiz: {
    question: "Which organelle is responsible for photosynthesis in plant cells?", 
    options: ["Mitochondria", "Nucleus", "Chloroplast", "Ribosome"],
    correct: 2
  }
};

export const EnhancedInteractiveDemo = () => {
  const [activeDemo, setActiveDemo] = useState<'smartNotes' | 'dashboard' | 'todos' | 'goals' | 'studyPlan' | 'flashcard' | 'quiz'>('smartNotes');
  const [notesView, setNotesView] = useState<'before' | 'after'>('before');
  const [currentCard, setCurrentCard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const demos = [
    { id: 'smartNotes', label: 'Smart Notes', icon: FileText, highlight: 'Enhanced' },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, highlight: 'Overview' },
    { id: 'studyPlan', label: 'Study Plans', icon: Calendar, highlight: 'New' },
    { id: 'todos', label: 'Smart ToDos', icon: CheckSquare, highlight: 'Organized' },
    { id: 'goals', label: 'Goal Tracking', icon: Target, highlight: 'Progress' },
    { id: 'flashcard', label: 'AI Flashcards', icon: Brain, highlight: 'Popular' },
    { id: 'quiz', label: 'Adaptive Quiz', icon: HelpCircle, highlight: 'AI-Powered' },
  ];

  return (
    <div className="py-24 bg-gradient-to-b from-white to-mint-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-mint-100 rounded-full text-mint-700 text-sm mb-8">
            🎯 Interactive Feature Demo
          </div>
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            See every feature in action
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Explore how our AI-powered tools transform your study experience across all subjects
          </p>
        </div>

        {/* Demo Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex flex-wrap bg-gray-100 rounded-lg p-1 gap-1">
            {demos.map((demo) => {
              const Icon = demo.icon;
              return (
                <button
                  key={demo.id}
                  onClick={() => setActiveDemo(demo.id as any)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all text-sm ${
                    activeDemo === demo.id
                      ? 'bg-white text-mint-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{demo.label}</span>
                  {demo.highlight && (
                    <Badge variant="secondary" className="bg-mint-100 text-mint-700 text-xs px-1 py-0">
                      {demo.highlight}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Demo Content */}
        <div className="max-w-5xl mx-auto">
          {activeDemo === 'smartNotes' && (
            <Card className="border-mint-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-mint-600" />
                    Smart Notes Enhancement
                    <Badge variant="secondary" className="bg-mint-100 text-mint-700">
                      Before vs After
                    </Badge>
                  </CardTitle>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setNotesView('before')}
                      className={`px-3 py-1 rounded text-sm transition-all ${
                        notesView === 'before' ? 'bg-white shadow-sm' : 'text-gray-600'
                      }`}
                    >
                      Before
                    </button>
                    <button
                      onClick={() => setNotesView('after')}
                      className={`px-3 py-1 rounded text-sm transition-all ${
                        notesView === 'after' ? 'bg-white shadow-sm' : 'text-gray-600'
                      }`}
                    >
                      After AI
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {notesView === 'before' ? (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">{demoData.smartNotes.before.title}</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 leading-relaxed">{demoData.smartNotes.before.content}</p>
                    </div>
                    <p className="text-sm text-gray-500 italic">Raw student notes - hard to study from</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <h3 className="font-semibold text-lg">{demoData.smartNotes.after.title}</h3>
                    <div className="bg-mint-50 p-4 rounded-lg border border-mint-200">
                      <p className="text-gray-800 font-medium mb-2">Enhanced Overview:</p>
                      <p className="text-gray-700 leading-relaxed">{demoData.smartNotes.after.content}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-blue-800 font-medium mb-2">AI Summary:</p>
                      <p className="text-blue-700 text-sm">{demoData.smartNotes.after.summary}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <p className="text-green-800 font-medium mb-2">Key Points:</p>
                      <ul className="text-green-700 text-sm space-y-1">
                        {demoData.smartNotes.after.keyPoints.map((point, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-green-600 mt-1">•</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <p className="text-purple-800 font-medium mb-2">Study Tips:</p>
                      <p className="text-purple-700 text-sm">{demoData.smartNotes.after.studyTips}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeDemo === 'dashboard' && (
            <Card className="border-mint-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LayoutDashboard className="h-5 w-5 text-mint-600" />
                  Study Dashboard Overview
                  <Badge variant="secondary" className="bg-mint-100 text-mint-700">
                    Central Hub
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <div className="bg-mint-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-mint-600">{demoData.dashboard.stats.studyStreak}</div>
                    <div className="text-sm text-mint-700">Day Study Streak</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{demoData.dashboard.stats.completionRate}%</div>
                    <div className="text-sm text-blue-700">Completion Rate</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{demoData.dashboard.stats.activeGoals}</div>
                    <div className="text-sm text-green-700">Active Goals</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-600">{demoData.dashboard.stats.pendingTasks}</div>
                    <div className="text-sm text-orange-700">Pending Tasks</div>
                  </div>
                </div>
                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-3">Recent Activity</h4>
                    <ul className="space-y-2">
                      {demoData.dashboard.recentActivity.map((activity, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                          <TrendingUp className="h-3 w-3 text-mint-600" />
                          {activity}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-3">Upcoming Tasks</h4>
                    <ul className="space-y-2">
                      {demoData.dashboard.upcomingTasks.map((task, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                          <CheckSquare className="h-3 w-3 text-blue-600" />
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeDemo === 'todos' && (
            <Card className="border-mint-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-mint-600" />
                  Smart ToDo Management
                  <Badge variant="secondary" className="bg-mint-100 text-mint-700">
                    AI Organized
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {demoData.todos.tasks.map((task, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckSquare className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-800">{task.title}</p>
                          <p className="text-sm text-gray-600">{task.category} • Due {task.due}</p>
                        </div>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={`${task.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}
                      >
                        {task.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
                <div className="mt-6 bg-mint-50 p-4 rounded-lg">
                  <p className="text-mint-800 font-medium mb-2">AI Smart Suggestions:</p>
                  <p className="text-mint-700 text-sm">
                    Based on your schedule, I recommend tackling the Chemistry Lab Report first, 
                    then reviewing Biology during your peak focus hours (2-4 PM).
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeDemo === 'goals' && (
            <Card className="border-mint-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-mint-600" />
                  SMART Goal Tracking
                  <Badge variant="secondary" className="bg-mint-100 text-mint-700">
                    Progress Driven
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {demoData.goals.activeGoals.map((goal, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-gray-800">{goal.title}</h4>
                        <span className="text-sm text-gray-600">{goal.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className="bg-mint-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${goal.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600">Target: {goal.target}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 bg-green-50 p-4 rounded-lg">
                  <p className="text-green-800 font-medium mb-2">Achievement Insights:</p>
                  <p className="text-green-700 text-sm">
                    You're on track to meet 2 out of 3 goals ahead of schedule! 
                    Consider increasing study time for SAT prep to stay on target.
                  </p>
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
                    AI Optimized
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-4">Today's Study Schedule</h4>
                    <div className="space-y-3">
                      {demoData.studyPlan.todayPlan.map((session, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm font-medium text-mint-600 w-16">{session.time}</div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{session.subject}</p>
                            <p className="text-sm text-gray-600">{session.task}</p>
                          </div>
                          <div className="text-sm text-gray-500">{session.duration}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-4">This Week's Goals</h4>
                    <ul className="space-y-2">
                      {demoData.studyPlan.weeklyGoals.map((goal, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                          <Target className="h-3 w-3 text-mint-600" />
                          {goal}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800 font-medium mb-2">AI Scheduling Insights:</p>
                  <p className="text-blue-700 text-sm">
                    Your study plan adapts to your peak performance times and upcoming deadlines. 
                    Math sessions are scheduled during your highest focus period (9-10 AM).
                  </p>
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
                      {showAnswer ? demoData.flashcard.back : demoData.flashcard.front}
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
                <div className="flex justify-center mt-4">
                  <Button
                    onClick={() => setShowAnswer(false)}
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
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <p className="text-green-800 text-sm">
                      ✓ Correct! Chloroplasts contain chlorophyll and are the site of photosynthesis in plant cells.
                    </p>
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
              Try All Features Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <p className="mt-2 text-sm text-gray-500">
            Experience the complete study suite - create your account in under 2 minutes
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedInteractiveDemo;
