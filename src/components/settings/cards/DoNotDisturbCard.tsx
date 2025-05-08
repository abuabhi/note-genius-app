
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormDescription } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { Moon, Clock, Save } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";
import { useDndMode, DndSettings } from "@/hooks/useDndMode";

interface DoNotDisturbCardProps {
  form: UseFormReturn<any>;
}

export const DoNotDisturbCard = ({ form }: DoNotDisturbCardProps) => {
  const { dndSettings, updateDndSettings, isDndActive } = useDndMode();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      const formattedHour = hour.toString().padStart(2, '0');
      options.push(`${formattedHour}:00`);
      options.push(`${formattedHour}:30`);
    }
    return options;
  };
  
  const timeOptions = generateTimeOptions();
  
  const handleSaveQuickSettings = async () => {
    setIsUpdating(true);
    try {
      const updatedSettings: DndSettings = {
        enabled: form.getValues("dndEnabled"),
        startTime: form.getValues("dndEnabled") ? form.getValues("dndStartTime") : null,
        endTime: form.getValues("dndEnabled") ? form.getValues("dndEndTime") : null,
      };
      
      await updateDndSettings(updatedSettings);
    } catch (error) {
      console.error("Error updating DND settings:", error);
      toast.error("Failed to update Do Not Disturb settings");
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Do Not Disturb</CardTitle>
            <CardDescription>
              Control when you don't want to receive notifications
            </CardDescription>
          </div>
          {isDndActive && (
            <div className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
              <Moon className="h-3 w-3 mr-1" />
              DND Active
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="dndEnabled"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="dnd-mode">Do Not Disturb Mode</Label>
                <FormDescription>
                  Pause all notifications when enabled
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  id="dnd-mode"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        {form.watch("dndEnabled") && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dndStartTime"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <Label>Start Time</Label>
                    </div>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select start time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeOptions.map(time => (
                          <SelectItem key={`start-${time}`} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="dndEndTime"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <Label>End Time</Label>
                    </div>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select end time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeOptions.map(time => (
                          <SelectItem key={`end-${time}`} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
            
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={handleSaveQuickSettings}
              disabled={isUpdating}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              {isUpdating ? "Saving..." : "Save DND Settings"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
