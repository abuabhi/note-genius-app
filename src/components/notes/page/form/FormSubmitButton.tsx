
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface FormSubmitButtonProps {
  isSaving: boolean;
  isUpdate: boolean;
}

export const FormSubmitButton = ({ isSaving, isUpdate }: FormSubmitButtonProps) => {
  return (
    <Button 
      type="submit" 
      disabled={isSaving} 
      className="w-full bg-mint-600 hover:bg-mint-700 text-white"
    >
      {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isSaving ? 'Saving...' : isUpdate ? 'Update Note' : 'Create Note'}
    </Button>
  );
};
