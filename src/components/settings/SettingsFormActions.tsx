
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { SettingsFormValues } from "./schemas/settingsFormSchema";
import { Save, RotateCcw } from "lucide-react";

interface SettingsFormActionsProps {
  form: UseFormReturn<SettingsFormValues>;
  isDirty: boolean;
  onReset: () => void;
}

export const SettingsFormActions = ({ form, isDirty, onReset }: SettingsFormActionsProps) => {
  return (
    <div className="flex justify-between items-center p-6 bg-gradient-to-r from-mint-50/30 to-blue-50/20 rounded-xl border border-mint-100/50">
      <Button 
        type="button" 
        variant="outline"
        onClick={onReset}
        disabled={!isDirty}
        className="flex items-center gap-2 border-mint-200 hover:bg-mint-50 disabled:opacity-50"
      >
        <RotateCcw className="h-4 w-4" />
        Reset Changes
      </Button>
      
      <Button 
        type="submit" 
        disabled={!isDirty || form.formState.isSubmitting}
        className="flex items-center gap-2 bg-mint-600 hover:bg-mint-700 shadow-lg hover:shadow-xl transition-all duration-200"
      >
        <Save className="h-4 w-4" />
        {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
};
