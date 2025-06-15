
import { useState } from "react";
import { Check, Clock, ListTodo, Plus } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { TodoList } from "@/components/todos/TodoList";
import { TodoFormDialog } from "@/components/todos/TodoFormDialog";
import { TodoStats } from "@/components/todos/TodoStats";
import { TodoSuggestions } from "@/components/todos/TodoSuggestions";
import { OverdueTodosSection } from "@/components/todos/OverdueTodosSection";
import { useTodos, TodoStatus, CreateTodoData, Todo } from "@/hooks/useTodos";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StandardPageHeader } from "@/components/ui/StandardPageHeader";

const TodosPage = () => {
  const { user, loading: authLoading } = useRequireAuth();
  const { 
    todos, 
    isLoading, 
    error, 
    createTodo, 
    updateTodoStatus,
    deleteTodo, 
    formatDate,
    filter,
    setFilter
  } = useTodos();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  const handleSubmit = async (data: CreateTodoData) => {
    await createTodo.mutateAsync(data);
    setShowCreateDialog(false);
  };

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
  };

  const handleEditSubmit = async (data: CreateTodoData) => {
    if (!editingTodo) return;
    
    console.log('Edit todo:', editingTodo.id, data);
    setEditingTodo(null);
  };

  const handleCreateFromTemplate = async (templateTodos: CreateTodoData[]) => {
    try {
      for (const todoData of templateTodos) {
        await createTodo.mutateAsync(todoData);
      }
    } catch (error) {
      console.error("Error creating todos from template:", error);
    }
  };

  const handleUpdateTodoStatus = (id: string, status: TodoStatus) => {
    updateTodoStatus.mutate({ id, status });
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
          <div className="container mx-auto p-4 md:p-6">
            <div className="flex items-center justify-center h-[80vh]">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 border-4 border-mint-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-mint-500 rounded-full border-t-transparent animate-spin"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  const breadcrumbs = [
    { label: "Todo List" }
  ];

  const actions = (
    <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
      <Plus className="h-4 w-4" />
      Create Todo
    </Button>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
        <StandardPageHeader
          title="Todo List"
          description="Organize and track your tasks and assignments"
          icon={<ListTodo className="h-6 w-6 text-white" />}
          breadcrumbs={breadcrumbs}
          actions={actions}
        />
        
        <div className="container mx-auto px-6 py-8">
          <div className="space-y-6">
            <TodoStats todos={todos} />
            <OverdueTodosSection />
            <TodoSuggestions onCreateFromTemplate={handleCreateFromTemplate} />

            <Card className="p-6">
              <Tabs 
                defaultValue="all" 
                value={filter}
                onValueChange={(value: any) => setFilter(value)}
                className="w-full"
              >
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="all" className="flex items-center gap-1">
                    <ListTodo className="h-4 w-4" />
                    <span>All</span>
                  </TabsTrigger>
                  <TabsTrigger value="overdue" className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Overdue</span>
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="flex items-center gap-1">
                    <Check className="h-4 w-4" />
                    <span>Completed</span>
                  </TabsTrigger>
                </TabsList>

                <TodoList
                  todos={todos}
                  isLoading={isLoading}
                  onUpdate={handleUpdateTodoStatus}
                  onDelete={deleteTodo.mutate}
                  onEdit={handleEdit}
                  formatDate={formatDate}
                />
              </Tabs>
            </Card>
          </div>

          <TodoFormDialog
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
            onSubmit={handleSubmit}
          />

          {editingTodo && (
            <TodoFormDialog
              open={!!editingTodo}
              onOpenChange={(open) => !open && setEditingTodo(null)}
              onSubmit={handleEditSubmit}
              editingTodo={editingTodo}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TodosPage;
