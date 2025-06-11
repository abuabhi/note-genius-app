
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { TodoTemplate, TemplateItem, CreateTodoData } from "./types";

export const useTemplates = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query for templates
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["todo-templates", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('todo_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match TodoTemplate type
      return data.map(template => ({
        ...template,
        category: template.subject, // Map subject to category
        template_items: template.template_items as unknown as TemplateItem[]
      })) as TodoTemplate[];
    },
    enabled: !!user,
  });

  // Create todos from template
  const createFromTemplate = useMutation({
    mutationFn: async (templateId: string) => {
      if (!user) throw new Error('User not authenticated');

      const template = templates.find(t => t.id === templateId);
      if (!template) throw new Error('Template not found');

      const todoPromises = template.template_items.map((item: TemplateItem) => {
        const todoData = {
          user_id: user.id,
          title: item.title,
          description: item.description,
          type: 'todo',
          status: 'new',
          priority: item.priority,
          recurrence: item.recurrence || 'none',
          template_id: templateId,
          delivery_methods: ['in_app'],
          reminder_time: new Date().toISOString(),
        };

        return supabase.from('reminders').insert(todoData);
      });

      const results = await Promise.all(todoPromises);
      const errors = results.filter(result => result.error);
      
      if (errors.length > 0) {
        throw new Error(`Failed to create ${errors.length} todos from template`);
      }

      return results;
    },
    onSuccess: (_, templateId) => {
      const template = templates.find(t => t.id === templateId);
      toast.success(`Created todos from "${template?.name}" template`);
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create from template: ${error.message}`);
    },
  });

  return {
    templates,
    isLoading,
    createFromTemplate,
  };
};
