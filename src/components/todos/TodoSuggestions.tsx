
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, PenTool, Calendar, Plus } from "lucide-react";
import { CreateTodoData } from "@/hooks/todos/types";

interface TodoSuggestionsProps {
  onCreateFromTemplate: (todos: CreateTodoData[]) => void;
}

export const TodoSuggestions = ({ onCreateFromTemplate }: TodoSuggestionsProps) => {
  const templates = [
    {
      id: "assignment-prep",
      title: "Assignment Preparation",
      description: "Complete workflow for any assignment",
      icon: <PenTool className="h-5 w-5" />,
      color: "from-blue-500 to-blue-600",
      todos: [
        { title: "Research assignment topic", priority: "high" as const, description: "Gather sources and understand requirements" },
        { title: "Create outline", priority: "medium" as const, description: "Structure main points and arguments" },
        { title: "Write first draft", priority: "high" as const, description: "Complete initial version" },
        { title: "Review and edit", priority: "medium" as const, description: "Check for errors and improve clarity" },
        { title: "Submit assignment", priority: "high" as const, description: "Final submission before deadline" },
      ]
    },
    {
      id: "exam-study",
      title: "Exam Study Plan",
      description: "Systematic approach to exam preparation",
      icon: <GraduationCap className="h-5 w-5" />,
      color: "from-green-500 to-green-600",
      todos: [
        { title: "Review syllabus and exam format", priority: "high" as const, description: "Understand what will be covered" },
        { title: "Create study schedule", priority: "medium" as const, description: "Plan study sessions leading up to exam" },
        { title: "Review lecture notes", priority: "high" as const, description: "Go through all class materials" },
        { title: "Practice with past exams", priority: "high" as const, description: "Test knowledge with sample questions" },
        { title: "Final review session", priority: "medium" as const, description: "Last-minute review before exam" },
      ]
    },
    {
      id: "daily-routine",
      title: "Daily Study Routine",
      description: "Essential daily tasks for academic success",
      icon: <Calendar className="h-5 w-5" />,
      color: "from-purple-500 to-purple-600",
      todos: [
        { title: "Review yesterday's notes", priority: "medium" as const, description: "Quick recap of previous day's learning" },
        { title: "Complete daily assignments", priority: "high" as const, description: "Finish all homework and tasks" },
        { title: "Read ahead for tomorrow", priority: "low" as const, description: "Preview upcoming material" },
        { title: "Update study planner", priority: "low" as const, description: "Keep schedule current" },
      ]
    },
    {
      id: "project-management",
      title: "Project Management",
      description: "End-to-end project completion workflow",
      icon: <BookOpen className="h-5 w-5" />,
      color: "from-orange-500 to-orange-600",
      todos: [
        { title: "Define project scope", priority: "high" as const, description: "Understand requirements and objectives" },
        { title: "Conduct research", priority: "high" as const, description: "Gather necessary information and sources" },
        { title: "Create project timeline", priority: "medium" as const, description: "Set milestones and deadlines" },
        { title: "Develop first draft", priority: "high" as const, description: "Create initial version of project" },
        { title: "Peer review session", priority: "medium" as const, description: "Get feedback from classmates" },
        { title: "Final presentation prep", priority: "high" as const, description: "Prepare for project presentation" },
      ]
    }
  ];

  const handleCreateFromTemplate = (template: typeof templates[0]) => {
    const todos: CreateTodoData[] = template.todos.map((todo, index) => ({
      title: todo.title,
      description: todo.description,
      priority: todo.priority,
      // Set due dates spread over the next week
      due_date: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000),
    }));
    onCreateFromTemplate(todos);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Quick Start Templates</h3>
          <p className="text-sm text-muted-foreground">Get started with pre-built student workflows</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardHeader className="pb-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${template.color} flex items-center justify-center text-white mb-2`}>
                {template.icon}
              </div>
              <CardTitle className="text-sm">{template.title}</CardTitle>
              <CardDescription className="text-xs">
                {template.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs text-muted-foreground mb-3">
                {template.todos.length} tasks included
              </div>
              <Button
                size="sm"
                onClick={() => handleCreateFromTemplate(template)}
                className="w-full h-8 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Use Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
