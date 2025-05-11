
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PREDEFINED_SUBJECTS } from "@/types/subject";

interface SubjectSelectionProps {
  selectedSubjects: Set<string>;
  toggleSubject: (subject: string) => void;
  customSubject: string;
  setCustomSubject: (subject: string) => void;
  addCustomSubject: () => void;
}

export const SubjectSelection = ({
  selectedSubjects,
  toggleSubject,
  customSubject,
  setCustomSubject,
  addCustomSubject
}: SubjectSelectionProps) => {
  return (
    <>
      {/* Subject Selection */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">
          Select your subjects <span className="text-red-500">*</span>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PREDEFINED_SUBJECTS.map((subject) => (
            <div key={subject} className="flex items-center space-x-2">
              <Checkbox 
                id={`subject-${subject}`} 
                checked={selectedSubjects.has(subject)}
                onCheckedChange={() => toggleSubject(subject)}
              />
              <Label htmlFor={`subject-${subject}`}>{subject}</Label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Add Custom Subject */}
      <div className="space-y-2">
        <Label htmlFor="customSubject" className="text-sm font-medium">
          Add a custom subject
        </Label>
        <div className="flex space-x-2">
          <Input
            id="customSubject"
            type="text"
            value={customSubject}
            onChange={(e) => setCustomSubject(e.target.value)}
            placeholder="Enter subject name"
            className="flex-1"
          />
          <Button 
            type="button" 
            onClick={addCustomSubject} 
            variant="outline"
            disabled={!customSubject.trim()}
          >
            Add
          </Button>
        </div>
      </div>
      
      {/* Selected Subjects */}
      {selectedSubjects.size > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Selected subjects:</h4>
          <div className="flex flex-wrap gap-2">
            {Array.from(selectedSubjects).map((subject) => (
              <div 
                key={subject} 
                className="bg-mint-100 text-mint-800 px-2 py-1 rounded-md text-sm flex items-center"
              >
                <span>{subject}</span>
                <button 
                  type="button" 
                  onClick={() => toggleSubject(subject)}
                  className="ml-1 text-mint-500 hover:text-mint-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
