
import { useState } from "react";
import { Check, CheckCheck, Clock, ListTodo } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { TodoList } from "@/components/todos/TodoList";
import { TodoForm } from "@/components/todos/TodoForm";
import { useTodos, TodoStatus } from "@/hooks/useTodos";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      await createTodo.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ListTodo className="h-7 w-7" />
            Todo List
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <TodoForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          </div>

          <div className="md:col-span-2">
            <Card className="p-4">
              <Tabs 
                defaultValue="all" 
                value={filter}
                onValueChange={(value: any) => setFilter(value)}
                className="w-full"
              >
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="all" className="flex items-center gap-1">
                    <CheckCheck className="h-4 w-4" />
                    <span>All</span>
                  </TabsTrigger>
                  <TabsTrigger value="pending" className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Pending</span>
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
                  formatDate={formatDate}
                />
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TodoPage;
