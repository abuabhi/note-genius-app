
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
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";

const TodoPage = () => {
  const { user, loading } = useRequireAuth();
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
  };

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
  };

  const handleEditSubmit = async (data: CreateTodoData) => {
    if (!editingTodo) return;
    
    // Update the todo using the existing mutation
    // For now, we'll just update the status since we don't have an update mutation
    // This should be replaced with a proper update mutation
    console.log('Edit todo:', editingTodo.id, data);
    
    // Close the edit dialog
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

  // This function adapts the mutation to the expected form
  const handleUpdateTodoStatus = (id: string, status: TodoStatus) => {
    updateTodoStatus.mutate({ id, status });
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-4 md:p-6 h-full">
          <div className="flex justify-center items-center h-[80vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    // Will redirect via useRequireAuth
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto p-4 md:p-6">
        <PageBreadcrumb pageName="Todo List" pageIcon={<ListTodo className="h-3 w-3" />} />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <ListTodo className="h-7 w-7" />
              Todo List
            </h1>
            <p className="text-muted-foreground mt-1">
              Organize and track your tasks and assignments
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Todo
          </Button>
        </div>

        <div className="space-y-6">
          {/* Stats */}
          <TodoStats todos={todos} />

          {/* Overdue Todos Section */}
          <OverdueTodosSection />

          {/* Quick Start Templates */}
          <TodoSuggestions onCreateFromTemplate={handleCreateFromTemplate} />

          {/* Main Content */}
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

        {/* Create Todo Dialog */}
        <TodoFormDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSubmit={handleSubmit}
        />

        {/* Edit Todo Dialog */}
        {editingTodo && (
          <TodoFormDialog
            open={!!editingTodo}
            onOpenChange={(open) => !open && setEditingTodo(null)}
            onSubmit={handleEditSubmit}
            editingTodo={editingTodo}
          />
        )}
      </div>
    </Layout>
  );
};

export default TodoPage;
