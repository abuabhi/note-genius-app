
import { ReactNode } from "react";
import { TabsContent } from "@/components/ui/tabs";

interface TabContentProps {
  value: string;
  children: ReactNode;
}

export function TabContent({ value, children }: TabContentProps) {
  return (
    <TabsContent value={value} className="space-y-4">
      <div className="text-sm">
        {children}
      </div>
    </TabsContent>
  );
}

export function GradesTabContent() {
  return (
    <TabContent value="grades">
      <p>Upload a CSV file with the following columns:</p>
      <ul className="list-disc list-inside mt-2">
        <li><strong>name</strong> (required): The grade name (e.g., "Grade 1")</li>
        <li><strong>level</strong> (required): A number representing the grade level</li>
        <li><strong>description</strong> (optional): A description of the grade</li>
      </ul>
    </TabContent>
  );
}

export function SubjectsTabContent() {
  return (
    <TabContent value="subjects">
      <p>Upload a CSV file with the following columns:</p>
      <ul className="list-disc list-inside mt-2">
        <li><strong>name</strong> (required): The subject name (e.g., "Math")</li>
        <li><strong>grade_name</strong> (required): The name of the grade this subject belongs to</li>
        <li><strong>description</strong> (optional): A description of the subject</li>
      </ul>
    </TabContent>
  );
}

export function SectionsTabContent() {
  return (
    <TabContent value="sections">
      <p>Upload a CSV file with the following columns:</p>
      <ul className="list-disc list-inside mt-2">
        <li><strong>name</strong> (required): The section name (e.g., "Algebra")</li>
        <li><strong>subject_name</strong> (required): The name of the subject this section belongs to</li>
        <li><strong>grade_name</strong> (required): The name of the grade</li>
        <li><strong>description</strong> (optional): A description of the section</li>
      </ul>
    </TabContent>
  );
}

export function FlashcardsTabContent() {
  return (
    <TabContent value="flashcards">
      <p>Upload a CSV file with the following columns:</p>
      <ul className="list-disc list-inside mt-2">
        <li><strong>set_name</strong> (required): The name of the flashcard set</li>
        <li><strong>front_content</strong> (required): The content for the front of the flashcard</li>
        <li><strong>back_content</strong> (required): The content for the back of the flashcard</li>
        <li><strong>subject_name</strong> (required): The name of the subject</li>
        <li><strong>grade_name</strong> (required): The name of the grade</li>
        <li><strong>section_name</strong> (optional): The name of the section</li>
        <li><strong>difficulty</strong> (optional): A number from 1-5 representing difficulty</li>
      </ul>
      <p className="mt-2">Note: All flashcards with the same set_name will be grouped into a single set.</p>
    </TabContent>
  );
}
