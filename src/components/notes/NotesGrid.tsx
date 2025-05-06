
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Note } from "@/types/note";
import { Camera, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
            <div className="flex flex-wrap gap-1 mt-3">
              {note.tags && note.tags.length > 0 && note.tags.map(tag => (
                <Badge 
                  key={tag.id || tag.name} 
                  style={{
                    backgroundColor: tag.color,
                    color: getBestTextColor(tag.color)
                  }}
                  className="flex items-center gap-1 text-xs"
                >
                  <Tag className="h-2.5 w-2.5" />
                  {tag.name}
                </Badge>
              ))}
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            {note.sourceType === 'scan' && (
              <div className="flex items-center">
                <Camera className="h-3 w-3 text-mint-500 mr-1" />
                <span className="text-xs text-mint-500">Scanned Note</span>
              </div>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

// Helper function to determine if black or white text will be more readable against a background color
function getBestTextColor(bgColor: string): string {
  // Remove the hash if it exists
  const color = bgColor.startsWith('#') ? bgColor.slice(1) : bgColor;
  
  // Convert to RGB
  let r, g, b;
  if (color.length === 3) {
    r = parseInt(color[0] + color[0], 16);
    g = parseInt(color[1] + color[1], 16);
    b = parseInt(color[2] + color[2], 16);
  } else {
    r = parseInt(color.slice(0, 2), 16);
    g = parseInt(color.slice(2, 4), 16);
    b = parseInt(color.slice(4, 6), 16);
  }
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return white for dark backgrounds, black for light backgrounds
  return luminance > 0.5 ? 'black' : 'white';
}
