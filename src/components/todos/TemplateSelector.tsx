
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useTemplates } from "@/hooks/todos/useTemplates";
import { Template, Plus, Briefcase, User, Zap } from "lucide-react";

export const TemplateSelector: React.FC = () => {
  const { templates, createFromTemplate } = useTemplates();

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'work': return <Briefcase className="h-4 w-4" />;
      case 'personal': return <User className="h-4 w-4" />;
      case 'productivity': return <Zap className="h-4 w-4" />;
      default: return <Template className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'work': return 'bg-blue-100 text-blue-800';
      case 'personal': return 'bg-green-100 text-green-800';
      case 'productivity': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <Template className="h-4 w-4 mr-2" />
          Use Template
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="start">
        <div className="p-4 border-b">
          <h3 className="font-medium">Choose a Template</h3>
          <p className="text-sm text-muted-foreground">Quick start with pre-built todo lists</p>
        </div>
        <div className="max-h-96 overflow-y-auto p-2">
          {templates.map((template) => (
            <Card key={template.id} className="mb-2 cursor-pointer hover:bg-gray-50 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(template.category)}
                    <CardTitle className="text-sm">{template.name}</CardTitle>
                  </div>
                  <Badge className={getCategoryColor(template.category)}>
                    {template.category}
                  </Badge>
                </div>
                {template.description && (
                  <CardDescription className="text-xs">
                    {template.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {template.template_items.length} tasks
                  </span>
                  <Button
                    size="sm"
                    onClick={() => createFromTemplate.mutate(template.id)}
                    disabled={createFromTemplate.isPending}
                    className="h-6 px-2 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Use
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
