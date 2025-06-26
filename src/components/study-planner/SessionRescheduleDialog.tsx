
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StudyPlanSession } from '@/types/studyPlanner';
import { format, addDays, startOfTomorrow } from 'date-fns';
import { CalendarDays, Clock } from 'lucide-react';

interface SessionRescheduleDialogProps {
  session: StudyPlanSession | null;
  isOpen: boolean;
  onClose: () => void;
  onReschedule: (params: { sessionId: string; newDate: string; newStartTime: string; newEndTime: string }) => Promise<void>;
  isRescheduling?: boolean;
}

export const SessionRescheduleDialog = ({
  session,
  isOpen,
  onClose,
  onReschedule,
  isRescheduling,
}: SessionRescheduleDialogProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // Generate time slots (every 30 minutes from 6 AM to 11 PM)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
        const displayTime = format(new Date(2000, 0, 1, hour, minute), 'h:mm a');
        slots.push({ value: time, label: displayTime });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const calculateEndTime = (start: string, durationMinutes: number) => {
    const [hours, minutes] = start.split(':').map(Number);
    const startDate = new Date(2000, 0, 1, hours, minutes);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    return format(endDate, 'HH:mm:ss');
  };

  const handleReschedule = async () => {
    if (!session || !selectedDate || !startTime) return;

    const newEndTime = endTime || calculateEndTime(startTime, session.duration_minutes);
    
    await onReschedule({
      sessionId: session.id,
      newDate: format(selectedDate, 'yyyy-MM-dd'),
      newStartTime: startTime,
      newEndTime: newEndTime,
    });

    onClose();
  };

  const quickRescheduleOptions = [
    { label: 'Tomorrow same time', date: addDays(new Date(), 1) },
    { label: 'Next week same day', date: addDays(new Date(), 7) },
    { label: 'Day after tomorrow', date: addDays(new Date(), 2) },
  ];

  const handleQuickReschedule = (date: Date) => {
    setSelectedDate(date);
    if (session) {
      setStartTime(session.scheduled_start_time);
      setEndTime(session.scheduled_end_time);
    }
  };

  if (!session) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Reschedule Session
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current session info */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="font-medium">{session.title}</div>
            <div className="text-sm text-gray-600">
              Currently: {format(new Date(session.scheduled_date), 'MMM dd, yyyy')} at {session.scheduled_start_time} - {session.scheduled_end_time}
            </div>
          </div>

          {/* Quick reschedule options */}
          <div>
            <label className="block text-sm font-medium mb-2">Quick Options</label>
            <div className="grid gap-2">
              {quickRescheduleOptions.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => handleQuickReschedule(option.date)}
                  className="justify-start"
                >
                  {option.label} - {format(option.date, 'MMM dd, yyyy')}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom date selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Choose Custom Date</label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < startOfTomorrow()}
              className="rounded-md border"
            />
          </div>

          {/* Time selection */}
          {selectedDate && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Time</label>
                <Select value={startTime} onValueChange={setStartTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot.value} value={slot.value}>
                        {slot.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">End Time</label>
                <Select value={endTime} onValueChange={setEndTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Auto-calculated" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot.value} value={slot.value}>
                        {slot.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Preview */}
          {selectedDate && startTime && (
            <div className="bg-mint-50 rounded-lg p-3">
              <div className="text-sm font-medium text-mint-700">New Schedule:</div>
              <div className="text-sm text-mint-600">
                {format(selectedDate, 'EEEE, MMM dd, yyyy')} at{' '}
                {format(new Date(`2000-01-01T${startTime}`), 'h:mm a')} -{' '}
                {format(new Date(`2000-01-01T${endTime || calculateEndTime(startTime, session.duration_minutes)}`), 'h:mm a')}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleReschedule}
              disabled={!selectedDate || !startTime || isRescheduling}
              className="flex-1"
            >
              <Clock className="h-4 w-4 mr-2" />
              Reschedule
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
