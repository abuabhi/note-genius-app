
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

// Temporary mock data for demonstration
const mockNotes = [
  {
    id: 1,
    title: "React Hooks",
    description: "Understanding useState and useEffect",
    date: "2025-04-25",
    category: "Programming",
  },
  {
    id: 2,
    title: "Data Structures",
    description: "Arrays, Linked Lists, and Trees",
    date: "2025-04-24",
    category: "Computer Science",
  },
  {
    id: 3,
    title: "TypeScript Basics",
    description: "Types, Interfaces, and Generics",
    date: "2025-04-23",
    category: "Programming",
  },
];

export const NotesGrid = () => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {mockNotes.map((note) => (
        <Card key={note.id} className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{note.title}</CardTitle>
                <CardDescription>{note.category}</CardDescription>
              </div>
              <span className="text-sm text-muted-foreground">{note.date}</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{note.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
