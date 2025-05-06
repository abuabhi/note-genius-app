
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Note } from "@/types/note";
import { Camera } from "lucide-react";

export const NotesGrid = ({ notes }: { notes: Note[] }) => {
  if (notes.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-lg text-mint-600">No notes found. Create a note or adjust your search.</p>
      </div>
    );
  }

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
