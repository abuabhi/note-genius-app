
import { useOptimizedNotes } from '@/contexts/OptimizedNotesContext';
import { SubjectTabs } from './SubjectTabs';
import { EmptySubjectState } from './EmptySubjectState';

export const SubjectsSection = () => {
  const { 
    notes,
    selectedSubject,
    setSelectedSubject,
    searchTerm
  } = useOptimizedNotes();

  const handleSubjectChange = (subject: string) => {
    setSelectedSubject(subject);
  };

  // Filter notes by subject if one is selected
  const filteredNotes = selectedSubject === 'all' 
    ? notes 
    : notes.filter(note => note.subject === selectedSubject);

  // Further filter by search term if present
  const searchFilteredNotes = searchTerm
    ? filteredNotes.filter(note => 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (note.content && note.content.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : filteredNotes;

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <SubjectTabs
          activeSubject={selectedSubject}
          onSubjectChange={handleSubjectChange}
        />
      </div>

      {searchFilteredNotes.length === 0 ? (
        <EmptySubjectState 
          hasSearchTerm={!!searchTerm}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {searchFilteredNotes.map((note) => (
            <div key={note.id} className="p-4 border rounded-lg">
              <h3 className="font-semibold">{note.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{note.description}</p>
              <div className="mt-2 text-xs text-gray-500">
                {note.subject} • {note.date}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
