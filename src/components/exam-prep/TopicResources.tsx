import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Plus, FileText, Layers, HelpCircle, Target, ListTodo } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useExamTopicLinks } from '@/hooks/exams';
import type { ExamTopic, ExamLinkResourceType } from '@/types/exam';
import { Link as RouterLink } from 'react-router-dom';

interface TopicResourcesProps {
  topic: ExamTopic;
  examSubjectName?: string;
}

interface ResourceOption {
  id: string;
  label: string;
  type: ExamLinkResourceType;
  href?: string;
}

const ICONS: Record<ExamLinkResourceType, React.ComponentType<{ className?: string }>> = {
  note: FileText,
  flashcard_set: Layers,
  quiz: HelpCircle,
  goal: Target,
  todo: ListTodo,
};

const TYPE_LABEL: Record<ExamLinkResourceType, string> = {
  note: 'Note',
  flashcard_set: 'Flashcards',
  quiz: 'Quiz',
  goal: 'Goal',
  todo: 'Todo',
};

export const TopicResources: React.FC<TopicResourcesProps> = ({ topic, examSubjectName }) => {
  const { user } = useAuth();
  const { links, addLink, removeLink } = useExamTopicLinks(topic.id);
  const [open, setOpen] = useState(false);

  const { data: resources = [] } = useQuery({
    queryKey: ['exam-link-options', user?.id, examSubjectName],
    enabled: !!user?.id && open,
    queryFn: async () => {
      const out: ResourceOption[] = [];
      const subjectFilter = examSubjectName?.trim();

      let notesQuery = supabase.from('notes').select('id, title, subject').eq('user_id', user!.id).limit(50);
      if (subjectFilter) notesQuery = notesQuery.ilike('subject', `%${subjectFilter}%`);
      const notesRes = await notesQuery;
      (notesRes.data || []).forEach(n =>
        out.push({ id: n.id, label: n.title || 'Untitled note', type: 'note', href: `/notes/study/${n.id}` })
      );

      let setsQuery = supabase.from('flashcard_sets').select('id, name, subject').eq('user_id', user!.id).limit(50);
      if (subjectFilter) setsQuery = setsQuery.ilike('subject', `%${subjectFilter}%`);
      const setsRes = await setsQuery;
      (setsRes.data || []).forEach(s =>
        out.push({ id: s.id, label: s.name || 'Untitled set', type: 'flashcard_set', href: `/flashcards/${s.id}` })
      );

      const quizzesRes = await supabase.from('quizzes').select('id, title').eq('user_id', user!.id).limit(50);
      (quizzesRes.data || []).forEach(q =>
        out.push({ id: q.id, label: q.title || 'Untitled quiz', type: 'quiz', href: `/quiz/${q.id}` })
      );

      let goalsQuery = supabase.from('study_goals').select('id, title, kind, academic_subject').eq('user_id', user!.id).limit(50);
      if (subjectFilter) goalsQuery = goalsQuery.ilike('academic_subject', `%${subjectFilter}%`);
      const goalsRes = await goalsQuery;
      (goalsRes.data || []).forEach((g: any) =>
        out.push({
          id: g.id,
          label: g.title || 'Untitled',
          type: g.kind === 'todo' ? 'todo' : 'goal',
          href: '/goals',
        })
      );

      return out;
    },
  });

  const linkedKeys = new Set(links.map(l => `${l.resource_type}:${l.resource_id}`));
  const optionMap = new Map(resources.map(r => [`${r.type}:${r.id}`, r]));

  return (
    <div className="border-t border-border px-3 py-2 space-y-2">
      <div className="flex flex-wrap items-center gap-1">
        {links.map(link => {
          const opt = optionMap.get(`${link.resource_type}:${link.resource_id}`);
          const Icon = ICONS[link.resource_type];
          return (
            <Badge key={link.id} variant="secondary" className="gap-1 pr-1">
              <Icon className="h-3 w-3" />
              {opt?.href ? (
                <RouterLink to={opt.href} className="hover:underline max-w-[160px] truncate">
                  {opt?.label ?? `${TYPE_LABEL[link.resource_type]} (linked)`}
                </RouterLink>
              ) : (
                <span className="max-w-[160px] truncate">
                  {opt?.label ?? `${TYPE_LABEL[link.resource_type]} (linked)`}
                </span>
              )}
              <button
                aria-label="Unlink"
                className="ml-1 rounded hover:bg-muted p-0.5"
                onClick={() => removeLink(link.id)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          );
        })}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs">
              <Plus className="h-3 w-3" /> Link resource
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-[320px]" align="start">
            <Command>
              <CommandInput placeholder="Search notes, flashcards, quizzes…" />
              <CommandList>
                <CommandEmpty>No matches.</CommandEmpty>
                {(['note','flashcard_set','quiz','goal','todo'] as ExamLinkResourceType[]).map(type => {
                  const items = resources.filter(r => r.type === type);
                  if (!items.length) return null;
                  const Icon = ICONS[type];
                  return (
                    <CommandGroup key={type} heading={TYPE_LABEL[type]}>
                      {items.map(item => {
                        const key = `${item.type}:${item.id}`;
                        const isLinked = linkedKeys.has(key);
                        return (
                          <CommandItem
                            key={key}
                            value={`${type} ${item.label}`}
                            disabled={isLinked}
                            onSelect={async () => {
                              await addLink({ resource_type: type, resource_id: item.id });
                              setOpen(false);
                            }}
                          >
                            <Icon className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                            <span className="truncate">{item.label}</span>
                            {isLinked && <span className="ml-auto text-[10px] text-muted-foreground">linked</span>}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  );
                })}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
