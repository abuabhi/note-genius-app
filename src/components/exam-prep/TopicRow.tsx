import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, GripVertical } from 'lucide-react';
import { TOPIC_STATUS_LABEL } from '@/types/exam';
import type { ExamTopic, TopicStatus } from '@/types/exam';
import { useExamTopics } from '@/hooks/exams';
import { TopicResources } from './TopicResources';

interface TopicRowProps {
  topic: ExamTopic;
  examId: string;
  examSubjectName?: string;
}

export const TopicRow: React.FC<TopicRowProps> = ({ topic, examId, examSubjectName }) => {
  const { updateTopic, deleteTopic, setTopicStatus } = useExamTopics(examId);
  const [name, setName] = useState(topic.name);
  const [editing, setEditing] = useState(false);

  const saveName = async () => {
    setEditing(false);
    if (name.trim() && name !== topic.name) {
      await updateTopic({ id: topic.id, name: name.trim() });
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 p-3">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
        {editing ? (
          <Input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            onBlur={saveName}
            onKeyDown={e => e.key === 'Enter' && saveName()}
            className="flex-1 h-8"
          />
        ) : (
          <button
            className="flex-1 text-left text-sm font-medium text-foreground truncate"
            onClick={() => setEditing(true)}
          >
            {topic.name}
          </button>
        )}
        <Select value={topic.status} onValueChange={(v: TopicStatus) => setTopicStatus(topic.id, v)}>
          <SelectTrigger className="h-8 w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(TOPIC_STATUS_LABEL) as TopicStatus[]).map(s => (
              <SelectItem key={s} value={s}>{TOPIC_STATUS_LABEL[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => deleteTopic(topic.id)}
          aria-label="Delete topic"
        >
          <Trash2 className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
      <TopicResources topic={topic} examSubjectName={examSubjectName} />
    </div>
  );
};
