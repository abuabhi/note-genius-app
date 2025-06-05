import { useState } from 'react';
import { PlusCircle, Search, Filter, Target, Zap, Trophy, Star } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { GoalCard } from '@/components/goals/GoalCard';
import { GoalFormDialog } from '@/components/goals/GoalFormDialog';
import { useStudyGoals, StudyGoal, GoalFormValues } from '@/hooks/useStudyGoals';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { FeatureDisabledAlert } from '@/components/routes/FeatureProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const GoalsPage = () => {
  const { loading: authLoading } = useRequireAuth();
  const { 
    goals, 
    loading: goalsLoading, 
    createGoal, 
    updateGoal, 
    deleteGoal,
    createGoalFromTemplate,
    dismissSuggestion,
    getGoalSuggestions,
    getStreakBonus,
    goalTemplates
  } = useStudyGoals();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<StudyGoal | undefined>(undefined);
  
  const handleCreateGoal = async (data: GoalFormValues) => {
    await createGoal(data);
  };
  
  const handleUpdateGoal = async (data: GoalFormValues) => {
    if (selectedGoal?.id) {
      await updateGoal(selectedGoal.id, data);
    }
  };
  
  const handleEditGoal = (goal: StudyGoal) => {
    setSelectedGoal(goal);
    setFormOpen(true);
  };

  const handleCreateFromTemplate = async (template: any) => {
    await createGoalFromTemplate(template);
  };
  
  const handleDismissSuggestion = (templateTitle: string) => {
    dismissSuggestion(templateTitle);
  };
  
  const filteredGoals = goals.filter(goal => {
    // Text search
    const matchesSearch = 
      goal.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (goal.description?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (goal.subject?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Status filter
    if (filter === 'completed') return goal.is_completed && matchesSearch;
    if (filter === 'in-progress') return !goal.is_completed && matchesSearch;
    
    // Show all that match the search
    return matchesSearch;
  });
  
  const sortedGoals = [...filteredGoals].sort((a, b) => {
    // Sort logic based on active tab
    if (activeTab === 'recent') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else if (activeTab === 'due-soon') {
      return new Date(a.end_date).getTime() - new Date(b.end_date).getTime();
    } else if (activeTab === 'progress') {
      return b.progress - a.progress;
    }
    // Default sorting: completed at the bottom, then by due date
    if (a.is_completed !== b.is_completed) {
      return a.is_completed ? 1 : -1;
    }
    return new Date(a.end_date).getTime() - new Date(b.end_date).getTime();
  });

  const loading = authLoading || goalsLoading;
  const completedGoalsCount = goals.filter(g => g.is_completed).length;
  const activeGoalsCount = goals.filter(g => !g.is_completed).length;
  const streakBonus = getStreakBonus();
  const suggestions = getGoalSuggestions();

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">Study Goals</h1>
            <p className="text-muted-foreground">Set, track, and achieve your study objectives</p>
          </div>
          <Button 
            onClick={() => {
              setSelectedGoal(undefined);
              setFormOpen(true);
            }}
            className="mt-4 md:mt-0"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Create Goal
          </Button>
        </div>

        {/* Gamification Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                Active Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-800">{activeGoalsCount}</div>
              <p className="text-xs text-blue-600">Currently pursuing</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Trophy className="h-4 w-4 text-green-600" />
                Completed Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">{completedGoalsCount}</div>
              <p className="text-xs text-green-600">Successfully achieved</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-orange-600" />
                Goal Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-800">{streakBonus}</div>
              <p className="text-xs text-orange-600">Consecutive completions</p>
            </CardContent>
          </Card>
        </div>

        {/* Goal Suggestions */}
        {suggestions.length > 0 && (
          <Card className="mb-6 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="h-5 w-5 text-purple-600" />
                Suggested Goals for You
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {suggestions.slice(0, 3).map((template, index) => (
                  <div 
                    key={index}
                    className="p-4 bg-white rounded-lg border border-purple-200 hover:shadow-md transition-shadow relative"
                  >
                    <button
                      onClick={() => handleDismissSuggestion(template.title)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label="Dismiss suggestion"
                    >
                      ×
                    </button>
                    <div 
                      className="cursor-pointer"
                      onClick={() => handleCreateFromTemplate(template)}
                    >
                      <div className="flex items-start justify-between mb-2 pr-6">
                        <h4 className="font-medium text-sm">{template.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {template.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{template.description}</p>
                      <div className="text-xs text-purple-600">
                        {template.target_hours}h • {template.duration_days} days
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        <FeatureDisabledAlert featureKey="goals" featureDisplayName="Study Goals" />
        
        <div className="mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-4">
              <TabsList className="mb-2 sm:mb-0">
                <TabsTrigger value="all">All Goals</TabsTrigger>
                <TabsTrigger value="due-soon">Due Soon</TabsTrigger>
                <TabsTrigger value="progress">By Progress</TabsTrigger>
                <TabsTrigger value="recent">Recent</TabsTrigger>
              </TabsList>
              
              <div className="flex flex-1 gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search goals..."
                    className="pl-8 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-[160px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <TabsContent value={activeTab} className="mt-0">
              {loading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="border rounded-md p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-4" />
                      <Skeleton className="h-2 w-full mb-2" />
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-8 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : sortedGoals.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {sortedGoals.map(goal => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onEdit={handleEditGoal}
                      onDelete={deleteGoal}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/20">
                  <Target className="h-12 w-12 text-muted-foreground mb-2" />
                  <h3 className="font-medium text-lg mb-1">No goals found</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {searchQuery || filter !== 'all' 
                      ? "No goals match your current filters. Try adjusting your search." 
                      : "Start by creating your first study goal or try a suggested goal above."}
                  </p>
                  <Button 
                    onClick={() => {
                      setSelectedGoal(undefined);
                      setFormOpen(true);
                    }}
                    variant="outline"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Create Goal
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        <GoalFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          onSubmit={selectedGoal ? handleUpdateGoal : handleCreateGoal}
          initialData={selectedGoal}
        />
      </div>
    </Layout>
  );
};

export default GoalsPage;
