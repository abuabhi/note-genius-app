
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FlashcardSetFormProps {
  setName: string;
  setDescription: string;
  onSetNameChange: (value: string) => void;
  onSetDescriptionChange: (value: string) => void;
  disabled: boolean;
}

export const FlashcardSetForm = ({
  setName,
  setDescription,
  onSetNameChange,
  onSetDescriptionChange,
  disabled
}: FlashcardSetFormProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="setName">Flashcard Set Name</Label>
        <Input
          id="setName"
          value={setName}
          onChange={(e) => onSetNameChange(e.target.value)}
          placeholder="Enter a name for your flashcard set"
          disabled={disabled}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="setDescription">Description (optional)</Label>
        <Input
          id="setDescription"
          value={setDescription}
          onChange={(e) => onSetDescriptionChange(e.target.value)}
          placeholder="Enter a description"
          disabled={disabled}
        />
      </div>
    </>
  );
};
