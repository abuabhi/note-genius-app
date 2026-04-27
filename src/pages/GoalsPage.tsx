import { useState } from 'react';
import { PlusCircle, Target } from 'lucide-react';
import { GoalFormDialog } from '@/components/goals/GoalFormDialog';
import { GoalStats } from '@/components/goals/GoalStats';
import { GoalSuggestions } from '@/components/goals/GoalSuggestions';
import { GoalFilters } from '@/components/goals/GoalFilters';
import { GoalsGrid } from '@/components/goals/GoalsGrid';
import { useStudyGoals, StudyGoal, GoalFormValues } from '@/hooks/useStudyGoals';
import { useGoalTracking } from '@/hooks/useGoalTracking';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Helmet } from 'react-helmet';

type SortKey = 'due-date' | 'progress' | 'recent';

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
    refreshSuggestions,
    hasContent,
  } = useStudyGoals();

  // Initialize automatic goal tracking
  useGoalTracking();

  const [searchQuery, setSearchQuery] = useState('');
  // Status filter from GoalFilters component (kept for search-bar parity)
  const [filter, setFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [sortKey, setSortKey] = useState<SortKey>('due-date');
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

  // 1. Tab filter (Active vs Completed)
  const tabFiltered = goals.filter(g =>
    activeTab === 'completed' ? g.is_completed : !g.is_completed
  );

  // 2. Search + status filter
  const filteredGoals = tabFiltered.filter(goal => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      goal.title.toLowerCase().includes(q) ||
      goal.description?.toLowerCase().includes(q) ||
      goal.subject?.toLowerCase().includes(q);
    return matchesSearch;
  });

  // 3. Sort
  const sortedGoals = [...filteredGoals].sort((a, b) => {
    if (sortKey === 'recent') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    if (sortKey === 'progress') {
      return b.progress - a.progress;
    }
    // due-date: overdue first, then ascending due date
    const today = new Date().getTime();
    const aDays = (new Date(a.end_date).getTime() - today) / 86_400_000;
    const bDays = (new Date(b.end_date).getTime() - today) / 86_400_000;
    const aOverdue = aDays < 0 && !a.is_completed;
    const bOverdue = bDays < 0 && !b.is_completed;
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;
    return new Date(a.end_date).getTime() - new Date(b.end_date).getTime();
  });

  const loading = authLoading || goalsLoading;
  const streakBonus: string | null = getStreakBonus();
  const suggestions = getGoalSuggestions();
  // Show the panel when the user hasn't built any goals yet — either to surface
  // grounded suggestions, or to nudge them to create some content first.
  const showSuggestions = goals.length === 0;

  const openCreateGoalDialog = (): void => {
    setSelectedGoal(undefined);
    setFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
      <Helmet>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-mint-500 to-blue-500 rounded-xl">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-mint-900">Study Goals</h1>
                <GoalStats goals={goals} streakBonus={streakBonus} />
              </div>
            </div>

            <Button onClick={openCreateGoalDialog}>
              <PlusCircle className="mr-2 h-4 w-4" /> New Goal
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Empty-state suggestions only — keeps the page focused once goals exist */}
          {showSuggestions && (
            <GoalSuggestions
              suggestions={suggestions}
              suggestionsEnabled={suggestionsEnabled}
              onCreateFromTemplate={handleCreateFromTemplate}
              onDismissSuggestion={handleDismissSuggestion}
              onToggleSuggestions={toggleSuggestions}
              onRefreshSuggestions={refreshSuggestions}
            />
          )}

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'active' | 'completed')}>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>

              <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                <GoalFilters
                  searchQuery={searchQuery}
                  filter={filter}
                  onSearchChange={setSearchQuery}
                  onFilterChange={setFilter}
                />
                <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="due-date">Due date</SelectItem>
                    <SelectItem value="progress">Progress</SelectItem>
                    <SelectItem value="recent">Recently created</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value={activeTab} className="mt-0">
              <GoalsGrid
                goals={sortedGoals}
                loading={loading}
                searchQuery={searchQuery}
                filter={filter}
                onEditGoal={handleEditGoal}
                onDeleteGoal={handleDeleteGoal}
                onCreateGoal={openCreateGoalDialog}
              />
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
    </div>
  );
};

export default GoalsPage;
