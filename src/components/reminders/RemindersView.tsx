
import { useState } from "react";
import { useReminders, Reminder } from "@/hooks/useReminders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Calendar,
  Clock,
  MoreHorizontal,
  X,
  CheckCircle,
  RepeatIcon,
  Mail,
  MessageSquare,
  Phone
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ReminderFormDialog } from "@/components/reminders/ReminderFormDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const RemindersView = () => {
  const { reminders, isLoading, cancelReminder } = useReminders();
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // Filter reminders by type
  const filteredReminders = reminders.filter(reminder => {
    if (activeTab === "all") return true;
    if (activeTab === "study") return reminder.type === "study";
    if (activeTab === "events") return reminder.type === "event";
    if (activeTab === "goals") return reminder.type === "goal";
    return true;
  });

  if (isLoading) {
    return <RemindersLoading />;
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl">Reminders</CardTitle>
        </div>
        <Button size="sm" onClick={() => setShowAddReminder(true)}>
          Add Reminder
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="study">Study</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {filteredReminders.length === 0 ? (
              <EmptyReminders />
            ) : (
              <div className="space-y-4">
                {filteredReminders.map((reminder) => (
                  <ReminderCard
                    key={reminder.id}
                    reminder={reminder}
                    onCancel={cancelReminder.mutate}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      {showAddReminder && (
        <ReminderFormDialog
          isOpen={showAddReminder}
          onClose={() => setShowAddReminder(false)}
          onReminderCreated={() => setShowAddReminder(false)}
        />
      )}
    </Card>
  );
};

interface ReminderCardProps {
  reminder: Reminder;
  onCancel: (id: string) => void;
}

const ReminderCard = ({ reminder, onCancel }: ReminderCardProps) => {
  const { formatReminderTime } = useReminders();

  return (
    <div className="flex items-start justify-between p-4 rounded-lg border bg-card">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <ReminderTypeIcon type={reminder.type} />
          <h3 className="font-medium">{reminder.title}</h3>
          {reminder.recurrence !== 'none' && (
            <Badge variant="outline" className="bg-primary/5 text-xs ml-2">
              <RepeatIcon className="h-3 w-3 mr-1" /> {reminder.recurrence}
            </Badge>
          )}
        </div>
        {reminder.description && (
          <p className="text-sm text-muted-foreground mb-2">
            {reminder.description}
          </p>
        )}
        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" />
          <span>{formatReminderTime(reminder.reminder_time)}</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          {reminder.delivery_methods.includes('email') && (
            <Badge variant="secondary" className="text-xs">
              <Mail className="h-3 w-3 mr-1" /> Email
            </Badge>
          )}
          {reminder.delivery_methods.includes('in_app') && (
            <Badge variant="secondary" className="text-xs">
              <Bell className="h-3 w-3 mr-1" /> App
            </Badge>
          )}
          {reminder.delivery_methods.includes('whatsapp') && (
            <Badge variant="secondary" className="text-xs">
              <Phone className="h-3 w-3 mr-1" /> WhatsApp
            </Badge>
          )}
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onCancel(reminder.id)}>
            <X className="h-4 w-4 mr-2" />
            Cancel Reminder
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

const ReminderTypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'study':
      return <CheckCircle className="h-4 w-4 text-blue-500" />;
    case 'event':
      return <Calendar className="h-4 w-4 text-purple-500" />;
    case 'goal':
      return <Clock className="h-4 w-4 text-green-500" />;
    default:
      return <Bell className="h-4 w-4 text-amber-500" />;
  }
};

const EmptyReminders = () => (
  <div className="flex flex-col items-center justify-center py-8 text-center">
    <Bell className="h-12 w-12 text-muted-foreground/30 mb-4" />
    <h3 className="font-medium">No reminders</h3>
    <p className="text-sm text-muted-foreground mt-1 max-w-xs">
      You don't have any reminders set. Add a reminder to get notified about
      important events and tasks.
    </p>
  </div>
);

const RemindersLoading = () => (
  <Card className="border shadow-sm">
    <CardHeader className="flex flex-row items-center justify-between">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-9 w-28" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-10 w-full mb-6" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-start p-4 rounded-lg border bg-card"
          >
            <div className="flex-1">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);
