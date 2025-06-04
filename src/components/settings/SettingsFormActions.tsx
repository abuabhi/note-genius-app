
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { SettingsFormValues } from "./schemas/settingsFormSchema";

interface SettingsFormActionsProps {
  form: UseFormReturn<SettingsFormValues>;
  isDirty: boolean;
  onReset: () => void;
}

export const SettingsFormActions = ({ form, isDirty, onReset }: SettingsFormActionsProps) => {
  return (
    <div className="flex justify-between">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onReset}
        disabled={!isDirty}
      >
        Reset
      </Button>
      <Button 
        type="submit" 
        disabled={!isDirty || form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
};
