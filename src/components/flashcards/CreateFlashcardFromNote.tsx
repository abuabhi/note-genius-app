import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useOptimizedNotes, OptimizedNotesProvider } from "@/contexts/OptimizedNotesContext";
import { useUserSubjects } from "@/hooks/useUserSubjects";
import { usePremiumFeatures } from "@/hooks/usePremiumFeatures";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AIFlashcardGenerator } from "@/components/notes/conversion/AIFlashcardGenerator";
import { FileText, ExternalLink, Search } from "lucide-react";
import { Note } from "@/types/note";

interface CreateFlashcardFromNoteProps {
  setId?: string;
  onSuccess?: () => void;
}

const Inner = ({ setId, onSuccess }: CreateFlashcardFromNoteProps) => {
  const { notes, loading } = useOptimizedNotes();
  const { subjects } = useUserSubjects();
  const { aiFlashcardGenerationEnabled } = usePremiumFeatures();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = (notes || []).filter((n) => !n.archived);
    if (!term) return list.slice(0, 50);
    return list
      .filter(
        (n) =>
          n.title?.toLowerCase().includes(term) ||
          n.content?.toLowerCase().includes(term),
      )
      .slice(0, 50);
  }, [notes, search]);

  const selectedNote: Note | undefined = useMemo(
    () => filtered.find((n) => n.id === selectedId) || (notes || []).find((n) => n.id === selectedId),
    [filtered, notes, selectedId],
  );

  const subjectName = useMemo(() => {
    if (!selectedNote) return "General";
    if (selectedNote.subject_id) {
      const found = subjects.find((s) => s.id === selectedNote.subject_id);
      if (found?.name) return found.name;
    }
    return selectedNote.subject || "General";
  }, [selectedNote, subjects]);

  if (!setId) {
    return (
      <div className="text-sm text-muted-foreground">
        Please select a flashcard set first.
      </div>
    );
  }

  if (loading && (!notes || notes.length === 0)) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (!loading && (!notes || notes.length === 0)) {
    return (
      <div className="text-center py-10 border border-dashed rounded-lg">
        <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
        <h3 className="font-medium mb-1">You don't have any notes yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Create a note first, then come back here to turn it into flashcards.
        </p>
        <Button asChild variant="outline">
          <Link to="/notes">Go to Notes</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your notes…"
            className="pl-9"
          />
        </div>
        <Button asChild variant="ghost" size="sm" className="shrink-0">
          <Link to="/note-to-flashcard" className="flex items-center gap-1 text-xs">
            Convert multiple <ExternalLink className="h-3 w-3" />
          </Link>
        </Button>
      </div>

      <ScrollArea className="h-72 border rounded-md">
        <RadioGroup
          value={selectedId ?? ""}
          onValueChange={(v) => setSelectedId(v)}
          className="p-2 space-y-1"
        >
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4 text-center">
              No notes match your search.
            </p>
          ) : (
            filtered.map((note) => {
              const subj = note.subject_id
                ? subjects.find((s) => s.id === note.subject_id)?.name
                : note.subject;
              const preview = (note.content || "")
                .replace(/<[^>]+>/g, "")
                .replace(/\s+/g, " ")
                .trim()
                .slice(0, 120);
              return (
                <Label
                  key={note.id}
                  htmlFor={`note-${note.id}`}
                  className="flex items-start gap-3 p-3 rounded-md hover:bg-muted cursor-pointer transition-colors"
                >
                  <RadioGroupItem
                    id={`note-${note.id}`}
                    value={note.id}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{note.title || "Untitled"}</span>
                      {subj && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-mint-100 text-mint-700 shrink-0">
                          {subj}
                        </span>
                      )}
                    </div>
                    {preview && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {preview}
                      </p>
                    )}
                  </div>
                </Label>
              );
            })
          )}
        </RadioGroup>
      </ScrollArea>

      {selectedNote && (
        <div>
          {aiFlashcardGenerationEnabled ? (
            <AIFlashcardGenerator
              noteContent={selectedNote.content || ""}
              enrichedContent={selectedNote.enriched_content ?? null}
              noteTitle={selectedNote.title || "Untitled"}
              flashcardSetId={setId}
              onFlashcardCreated={onSuccess}
              isGenerating={isGenerating}
              setIsGenerating={setIsGenerating}
              subjectName={subjectName}
            />
          ) : (
            <div className="border border-yellow-200 bg-yellow-50 rounded-md p-4">
              <h3 className="font-medium text-amber-700">AI Flashcard Generation</h3>
              <p className="text-sm text-amber-600 mt-1">
                Automatically generate flashcards from your notes using AI. Upgrade to premium to access this feature.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const CreateFlashcardFromNote = (props: CreateFlashcardFromNoteProps) => {
  return (
    <OptimizedNotesProvider>
      <Inner {...props} />
    </OptimizedNotesProvider>
  );
};

export default CreateFlashcardFromNote;
