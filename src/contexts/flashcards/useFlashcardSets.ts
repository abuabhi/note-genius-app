// @ts-nocheck

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth"; // Updated import path
import { toast } from "sonner";
import {
  FlashcardState,
  FlashcardSet,
  Subject,
  FlashcardSetWithCount,
} from "./types";

export const useFlashcardSets = (state?: FlashcardState) => {
  const { user } = useAuth();
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSetWithCount[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchFlashcardSets();
      fetchUserSubjects();
    }
  }, [user]);

  const fetchFlashcardSets = async () => {
    try {
      setIsLoading(true);
      if (!user) {
        console.log("No user, returning empty array");
        return [];
      }

      console.log("Fetching flashcard sets for user:", user.id);

      const { data, error } = await supabase
        .from("flashcard_sets")
        .select("*, card_count:flashcard_set_cards(count)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching flashcard sets:", error);
        throw error;
      }

      const setsWithCount: FlashcardSetWithCount[] = (data || []).map(set => ({
        ...set,
        card_count: set.card_count ? set.card_count[0]?.count : 0,
      }));

      console.log("Fetched flashcard sets:", setsWithCount);
      setFlashcardSets(setsWithCount);
      return setsWithCount;
    } catch (error) {
      console.error("Error fetching flashcard sets:", error);
      toast.error("Failed to load flashcard sets");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserSubjects = async () => {
    try {
      setIsLoading(true);
      if (!user) {
        console.log("No user, returning empty array");
        return [];
      }

      console.log("Fetching subjects for user:", user.id);

      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .eq("user_id", user.id)
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching subjects:", error);
        throw error;
      }

      console.log("Fetched subjects:", data);
      setSubjects(data || []);
      return data || [];
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast.error("Failed to load subjects");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const createFlashcardSet = async (set: FlashcardSet) => {
    try {
      setIsLoading(true);

      if (!user) {
        throw new Error("User must be logged in to create flashcard set");
      }

      const { data, error } = await supabase
        .from("flashcard_sets")
        .insert({
          ...set,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating flashcard set:", error);
        throw error;
      }

      const newSet: FlashcardSetWithCount = { ...data, card_count: 0 };
      setFlashcardSets((prevSets) => [...prevSets, newSet]);
      toast.success("Flashcard set created successfully!");
      return newSet;
    } catch (error) {
      console.error("Error creating flashcard set:", error);
      toast.error("Failed to create flashcard set");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateFlashcardSet = async (id: string, updates: Partial<FlashcardSet>) => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("flashcard_sets")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating flashcard set:", error);
        throw error;
      }

      setFlashcardSets((prevSets) =>
        prevSets.map((set) => (set.id === id ? { ...set, ...data } : set))
      );
      toast.success("Flashcard set updated successfully!");
      return data;
    } catch (error) {
      console.error("Error updating flashcard set:", error);
      toast.error("Failed to update flashcard set");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFlashcardSet = async (id: string) => {
    try {
      setIsLoading(true);

      const { error } = await supabase
        .from("flashcard_sets")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting flashcard set:", error);
        throw error;
      }

      setFlashcardSets((prevSets) => prevSets.filter((set) => set.id !== id));
      toast.success("Flashcard set deleted successfully!");
    } catch (error) {
      console.error("Error deleting flashcard set:", error);
      toast.error("Failed to delete flashcard set");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createSubject = async (subject: Subject) => {
    try {
      setIsLoading(true);

      if (!user) {
        throw new Error("User must be logged in to create a subject");
      }

      const { data, error } = await supabase
        .from("subjects")
        .insert({
          ...subject,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating subject:", error);
        throw error;
      }

      setSubjects((prevSubjects) => [...prevSubjects, data]);
      toast.success("Subject created successfully!");
      return data;
    } catch (error) {
      console.error("Error creating subject:", error);
      toast.error("Failed to create subject");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSubject = async (id: string, updates: Partial<Subject>) => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("subjects")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating subject:", error);
        throw error;
      }

      setSubjects((prevSubjects) =>
        prevSubjects.map((subject) => (subject.id === id ? { ...subject, ...data } : subject))
      );
      toast.success("Subject updated successfully!");
      return data;
    } catch (error) {
      console.error("Error updating subject:", error);
      toast.error("Failed to update subject");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSubject = async (id: string) => {
    try {
      setIsLoading(true);

      const { error } = await supabase
        .from("subjects")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting subject:", error);
        throw error;
      }

      setSubjects((prevSubjects) => prevSubjects.filter((subject) => subject.id !== id));
      toast.success("Subject deleted successfully!");
    } catch (error) {
      console.error("Error deleting subject:", error);
      toast.error("Failed to delete subject");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    flashcardSets,
    subjects,
    isLoading,
    fetchFlashcardSets,
    fetchUserSubjects,
    createFlashcardSet,
    updateFlashcardSet,
    deleteFlashcardSet,
    createSubject,
    updateSubject,
    deleteSubject,
    setFlashcardSets,
    setSubjects,
  };
};
