import { useState } from 'react';
import { PlusCircle, Target } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { GoalFormDialog } from '@/components/goals/GoalFormDialog';
import { GoalStats } from '@/components/goals/GoalStats';
import { GoalSuggestions } from '@/components/goals/GoalSuggestions';
import { GoalFilters } from '@/components/goals/GoalFilters';
import { GoalsGrid } from '@/components/goals/GoalsGrid';
import { OverdueGoalsSection } from '@/components/goals/OverdueGoalsSection';
import { GoalNotifications } from '@/components/goals/GoalNotifications';
import { GoalAnalytics } from '@/components/goals/GoalAnalytics';
import { useStudyGoals, StudyGoal, GoalFormValues } from '@/hooks/useStudyGoals';
import { useGoalTracking } from '@/hooks/useGoalTracking';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageBreadcrumb } from '@/components/ui/page-breadcrumb';

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

  const handleDeleteGoal = async (goalId: string): Promise<boolean> => {
    try {
      return await deleteGoal(goalId);
    } catch (error) {
      console.error('Error deleting goal:', error);
      return false;
    }
  };

  const handleGoalNotificationAction = (goalId: string, action: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal && action === 'view') {
      handleEditGoal(goal);
    } else if (goal && action === 'extend') {
      // Open the goal for editing to extend deadline
      setSelectedGoal(goal);
      setFormOpen(true);
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
    // Default sorting: completed at the bottom, then by due date
    if (a.is_completed !== b.is_completed) {
      return a.is_completed ? 1 : -1;
    }
    return new Date(a.end_date).getTime() - new Date(b.end_date).getTime();
  });

  const loading = authLoading || goalsLoading;
  const streakBonus = getStreakBonus();
  const suggestions = getGoalSuggestions();

  const openCreateGoalDialog = () => {
    setSelectedGoal(undefined);
    setFormOpen(true);
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <PageBreadcrumb pageName="Study Goals" pageIcon={<Target className="h-3 w-3" />} />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">Study Goals</h1>
            <p className="text-muted-foreground">Set, track, and achieve your study objectives automatically</p>
          </div>
          <Button 
            onClick={openCreateGoalDialog}
            className="mt-4 md:mt-0"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Create Goal
          </Button>
        </div>

        <div className="space-y-6">
          <GoalStats goals={goals} streakBonus={streakBonus} />

          <GoalNotifications 
            goals={goals} 
            onGoalAction={handleGoalNotificationAction}
          />

          <OverdueGoalsSection />

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
    </Layout>
  );
};

export default GoalsPage;
