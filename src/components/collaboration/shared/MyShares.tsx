// @ts-nocheck

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth"; // Updated import path
import { toast } from "sonner";

const MyShares = () => {
  const [sharedNotes, setSharedNotes] = useState([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSharedNotes = async () => {
      setLoading(true);
      if (user) {
        try {
          const { data, error } = await supabase
            .from("note_shares")
            .select("note_id, shared_with_email")
            .eq("shared_by_user_id", user.id);

          if (error) {
            console.error("Error fetching shared notes:", error);
            toast.error("Failed to fetch shared notes.");
          } else {
            // Fetch the actual note details for each shared note
            const noteIds = data.map((share) => share.note_id);
            if (noteIds.length > 0) {
              const { data: notesData, error: notesError } = await supabase
                .from("notes")
                .select("id, title")
                .in("id", noteIds);

              if (notesError) {
                console.error("Error fetching note details:", notesError);
                toast.error("Failed to fetch note details.");
              } else {
                // Combine the shared note info with the note details
                const combinedData = data.map((share) => {
                  const note = notesData.find((note) => note.id === share.note_id);
                  return {
                    ...share,
                    noteTitle: note ? note.title : "Unknown Note",
                  };
                });
                setSharedNotes(combinedData);
              }
            } else {
              setSharedNotes([]); // No shared notes found
            }
          }
        } catch (error) {
          console.error("Error fetching shared notes:", error);
          toast.error("Failed to fetch shared notes.");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchSharedNotes();
  }, [user]);

  return (
    <div>
      <h2>My Shares</h2>
      {loading ? (
        <p>Loading...</p>
      ) : sharedNotes.length === 0 ? (
        <p>No notes have been shared by you.</p>
      ) : (
        <ul>
          {sharedNotes.map((share) => (
            <li key={`${share.note_id}-${share.shared_with_email}`}>
              You shared note "{share.noteTitle}" with {share.shared_with_email}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyShares;
