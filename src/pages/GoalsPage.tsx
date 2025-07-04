
import { useState } from 'react';
import { PlusCircle, Target } from 'lucide-react';
import { GoalFormDialog } from '@/components/goals/GoalFormDialog';
import { GoalStats } from '@/components/goals/GoalStats';
import { GoalSuggestions } from '@/components/goals/GoalSuggestions';
import { GoalFilters } from '@/components/goals/GoalFilters';
import { GoalsGrid } from '@/components/goals/GoalsGrid';
import { GoalAnalytics } from '@/components/goals/GoalAnalytics';
import { useStudyGoals, StudyGoal, GoalFormValues } from '@/hooks/useStudyGoals';
import { useGoalTracking } from '@/hooks/useGoalTracking';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
    suggestionsEnabled,
    toggleSuggestions,
    refreshSuggestions
  } = useStudyGoals();
  
  // Initialize automatic goal tracking
  useGoalTracking();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<StudyGoal | undefined>(undefined);
  
  const handleCreateGoal = async (data: GoalFormValues): Promise<void> => {
    await createGoal(data);
  };
  
  const handleUpdateGoal = async (data: GoalFormValues): Promise<void> => {
    if (selectedGoal?.id) {
      await updateGoal(selectedGoal.id, data);
    }
  };
  
  const handleEditGoal = (goal: StudyGoal): void => {
    setSelectedGoal(goal);
    setFormOpen(true);
  };

  const handleCreateFromTemplate = async (template: any): Promise<void> => {
    await createGoalFromTemplate(template);
  };
  
  const handleDismissSuggestion = (templateTitle: string): void => {
    dismissSuggestion(templateTitle);
  };

  const handleDeleteGoal = async (goalId: string): Promise<boolean> => {
    try {
      return await deleteGoal(goalId);
    } catch (error) {
      console.error('Error deleting goal:', error);
      return false;
    }
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
    } else if (activeTab === 'analytics') {
      // No sorting needed for analytics tab
      return 0;
    }
    
    // Intelligent sorting: overdue first, due soon second, then regular goals
    const today = new Date();
    const aDaysLeft = Math.ceil((new Date(a.end_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const bDaysLeft = Math.ceil((new Date(b.end_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    const aIsOverdue = aDaysLeft < 0 && !a.is_completed;
    const bIsOverdue = bDaysLeft < 0 && !b.is_completed;
    const aIsDueSoon = aDaysLeft <= 3 && aDaysLeft >= 0 && !a.is_completed;
    const bIsDueSoon = bDaysLeft <= 3 && bDaysLeft >= 0 && !b.is_completed;
    
    // Completed goals go to bottom
    if (a.is_completed !== b.is_completed) {
      return a.is_completed ? 1 : -1;
    }
    
    // Overdue goals go first
    if (aIsOverdue && !bIsOverdue) return -1;
    if (!aIsOverdue && bIsOverdue) return 1;
    
    // Due soon goals go second
    if (aIsDueSoon && !bIsDueSoon && !bIsOverdue) return -1;
    if (!aIsDueSoon && bIsDueSoon && !aIsOverdue) return 1;
    
    // Then sort by due date
    return new Date(a.end_date).getTime() - new Date(b.end_date).getTime();
  });

  const loading = authLoading || goalsLoading;
  const streakBonus: string | null = getStreakBonus();
  const suggestions = getGoalSuggestions();

  const openCreateGoalDialog = (): void => {
    setSelectedGoal(undefined);
    setFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
      {/* Simple page header without StandardPageHeader */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-mint-500 to-blue-500 rounded-xl">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-mint-900">Study Goals</h1>
                <p className="text-gray-600 mt-1">Set, track, and achieve your study objectives automatically</p>
              </div>
            </div>
            
            <Button onClick={openCreateGoalDialog}>
              <PlusCircle className="mr-2 h-4 w-4" /> Create Goal
            </Button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          <GoalStats goals={goals} streakBonus={streakBonus} />

          <GoalSuggestions
            suggestions={suggestions}
            suggestionsEnabled={suggestionsEnabled}
            onCreateFromTemplate={handleCreateFromTemplate}
            onDismissSuggestion={handleDismissSuggestion}
            onToggleSuggestions={toggleSuggestions}
            onRefreshSuggestions={refreshSuggestions}
          />
          
          <div className="mb-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-4">
                <TabsList className="mb-2 sm:mb-0">
                  <TabsTrigger value="all">All Goals</TabsTrigger>
                  <TabsTrigger value="due-soon">Due Soon</TabsTrigger>
                  <TabsTrigger value="progress">By Progress</TabsTrigger>
                  <TabsTrigger value="recent">Recent</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>
                
                {activeTab !== 'analytics' && (
                  <GoalFilters
                    searchQuery={searchQuery}
                    filter={filter}
                    onSearchChange={setSearchQuery}
                    onFilterChange={setFilter}
                  />
                )}
              </div>
              
              <TabsContent value={activeTab} className="mt-0">
                {activeTab === 'analytics' ? (
                  <GoalAnalytics goals={goals} />
                ) : (
                  <GoalsGrid
                    goals={sortedGoals}
                    loading={loading}
                    searchQuery={searchQuery}
                    filter={filter}
                    onEditGoal={handleEditGoal}
                    onDeleteGoal={handleDeleteGoal}
                    onCreateGoal={openCreateGoalDialog}
                  />
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        <GoalFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          onSubmit={selectedGoal ? handleUpdateGoal : handleCreateGoal}
          initialData={selectedGoal}
        />
      </div>
    </div>
  );
};

export default GoalsPage;
