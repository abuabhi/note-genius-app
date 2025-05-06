
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Note } from "@/types/note";

// Temporary mock data for demonstration
const mockNotes: Note[] = [
  {
    id: "1",
    title: "React Hooks",
    description: "Understanding useState and useEffect",
    date: "2025-04-25",
    category: "Programming",
  },
  {
    id: "2",
    title: "Data Structures",
    description: "Arrays, Linked Lists, and Trees",
    date: "2025-04-24",
    category: "Computer Science",
  },
  {
    id: "3",
    title: "TypeScript Basics",
    description: "Types, Interfaces, and Generics",
    date: "2025-04-23",
    category: "Programming",
  },
];

export const NotesGrid = ({ notes = mockNotes }: { notes?: Note[] }) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {notes.map((note) => (
        <Card key={note.id} className="hover:shadow-lg transition-shadow cursor-pointer border-mint-100 bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl text-mint-800">{note.title}</CardTitle>
                <CardDescription className="text-mint-600">{note.category}</CardDescription>
              </div>
              <span className="text-sm text-mint-600">{note.date}</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-mint-700">{note.description}</p>
            {note.sourceType === 'scan' && (
              <div className="mt-2 flex items-center">
                <Camera className="h-3 w-3 text-mint-500 mr-1" />
                <span className="text-xs text-mint-500">Scanned Note</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
