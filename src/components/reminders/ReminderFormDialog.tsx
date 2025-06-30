
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { useQueryClient } from "@tanstack/react-query";

interface ReminderFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onReminderCreated: () => void;
}

export const ReminderFormDialog = ({ isOpen, onClose, onReminderCreated }: ReminderFormDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    reminderTime: new Date(),
    type: "general" as const,
    priority: "medium" as const,
    deliveryMethods: ["in_app"] as string[],
    recurrence: "none" as const,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from('reminders').insert({
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        reminder_time: formData.reminderTime.toISOString(),
        type: formData.type,
        priority: formData.priority,
        delivery_methods: formData.deliveryMethods,
        recurrence: formData.recurrence,
        status: 'pending',
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Reminder created successfully",
      });

      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({
        queryKey: ['scalable-reminders', user.id],
        exact: false,
      });

      onReminderCreated();
      onClose();
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        reminderTime: new Date(),
        type: "general",
        priority: "medium",
        deliveryMethods: ["in_app"],
        recurrence: "none",
      });
    } catch (error) {
      console.error('Error creating reminder:', error);
      toast({
        title: "Error",
        description: "Failed to create reminder. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeliveryMethodChange = (method: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      deliveryMethods: checked 
        ? [...prev.deliveryMethods, method]
        : prev.deliveryMethods.filter(m => m !== method)
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Reminder
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter reminder title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter reminder description (optional)"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Reminder Time *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.reminderTime, "PPP p")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.reminderTime}
                    onSelect={(date) => {
                      if (date) {
                        setFormData(prev => ({ ...prev, reminderTime: date }));
                      }
                    }}
                    initialFocus
                  />
                  <div className="p-3 border-t">
                    <Input
                      type="time"
                      value={format(formData.reminderTime, "HH:mm")}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(':');
                        const newDate = new Date(formData.reminderTime);
                        newDate.setHours(parseInt(hours), parseInt(minutes));
                        setFormData(prev => ({ ...prev, reminderTime: newDate }));
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: "low" | "medium" | "high") => 
                  setFormData(prev => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Delivery Methods</Label>
            <div className="flex flex-wrap gap-4">
              {[
                { id: 'in_app', label: 'In-App Notification' },
                { id: 'email', label: 'Email' },
                { id: 'whatsapp', label: 'WhatsApp' },
              ].map((method) => (
                <div key={method.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={method.id}
                    checked={formData.deliveryMethods.includes(method.id)}
                    onCheckedChange={(checked) => 
                      handleDeliveryMethodChange(method.id, checked as boolean)
                    }
                  />
                  <Label htmlFor={method.id} className="text-sm">
                    {method.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Reminder"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
