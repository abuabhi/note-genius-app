
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";

// Temporary mock data for demonstration
const mockEvents = [
  {
    id: 1,
    title: "Study Session",
    date: new Date(2025, 3, 25),
    type: "study",
  },
  {
    id: 2,
    title: "Group Project",
    date: new Date(2025, 3, 26),
    type: "group",
  },
];

export const ScheduleCalendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Function to check if a date has events
  const hasEvents = (day: Date | undefined) => {
    if (!day) return false;
    return mockEvents.some(
      (event) => event.date.toDateString() === day.toDateString()
    );
  };

  return (
    <Card className="p-4">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border w-full pointer-events-auto"
            modifiers={{
              hasEvent: (date) => hasEvents(date),
            }}
            modifiersStyles={{
              hasEvent: { fontWeight: 'bold', backgroundColor: '#e5deff' }
            }}
          />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold mb-4">
            {date ? date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}
          </h2>
          <div className="space-y-4">
            {mockEvents
              .filter((event) => event.date.toDateString() === date?.toDateString())
              .map((event) => (
                <div
                  key={event.id}
                  className="p-3 rounded-lg bg-secondary"
                >
                  <h3 className="font-medium">{event.title}</h3>
                  <p className="text-sm text-muted-foreground">{event.type}</p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
