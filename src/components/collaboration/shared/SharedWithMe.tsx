// @ts-nocheck

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth"; // Updated import path
import { useNavigate } from "react-router-dom";

const SharedWithMe = () => {
  const [sharedNotes, setSharedNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSharedNotes = async () => {
      setLoading(true);
      try {
        if (!user) {
          console.log("User not logged in");
          return;
        }

        const { data, error } = await supabase
          .from("note_shares")
          .select("note_id, notes (title, description)")
          .eq("shared_with", user.id)
          .eq("status", "accepted")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching shared notes:", error);
          toast.error("Failed to load shared notes.");
        }

        if (data) {
          // Extract the note details from the 'notes' object
          const notes = data.map((item) => ({
            note_id: item.note_id,
            title: item.notes?.title,
            description: item.notes?.description,
          }));
          setSharedNotes(notes);
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("Unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchSharedNotes();
  }, [user]);

  if (loading) {
    return <div>Loading shared notes...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Shared Notes</h2>
      {sharedNotes.length === 0 ? (
        <p>No notes have been shared with you.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sharedNotes.map((note) => (
            <div
              key={note.note_id}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition duration-300"
            >
              <h3 className="text-lg font-semibold">{note.title}</h3>
              <p className="text-gray-600">{note.description}</p>
              <button
                onClick={() => navigate(`/note/${note.note_id}`)}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                View Note
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SharedWithMe;
