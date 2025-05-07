
import { supabase } from "@/integrations/supabase/client";

export const seedSubjectCategories = async () => {
  try {
    const { data: existingCategories } = await supabase
      .from('subject_categories')
      .select('name')
      .limit(1);
    
    // If we already have categories, don't seed
    if (existingCategories && existingCategories.length > 0) {
      return { success: true, message: "Categories already exist, skipping seeding" };
    }

    // Define categories
    const categories = [
      { name: "Mathematics", level: 0 },
      { name: "Sciences", level: 0 },
      { name: "Languages", level: 0 },
      { name: "History", level: 0 },
      { name: "Arts", level: 0 },
      { name: "Computer Science", level: 0 }
    ];

    const { error } = await supabase
      .from('subject_categories')
      .insert(categories);
    
    if (error) throw error;
    
    return { success: true, message: "Subject categories seeded successfully" };
  } catch (error) {
    console.error("Error seeding subject categories:", error);
    return { success: false, message: "Failed to seed subject categories" };
  }
};

export const seedFlashcardSets = async () => {
  try {
    const { data: existingSets } = await supabase
      .from('flashcard_sets')
      .select('id')
      .eq('is_built_in', true)
      .limit(1);
    
    // If we already have built-in sets, don't seed
    if (existingSets && existingSets.length > 0) {
      return { success: true, message: "Flashcard sets already exist, skipping seeding" };
    }

    // Get categories for foreign keys
    const { data: categories } = await supabase
      .from('subject_categories')
      .select('id, name');
    
    if (!categories || categories.length === 0) {
      return { success: false, message: "No categories found, please seed categories first" };
    }

    // Create a map of category names to IDs
    const categoryMap: Record<string, string> = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat.id;
    });

    // Define sets with their subject categories
    const mathId = categoryMap["Mathematics"];
    const scienceId = categoryMap["Sciences"];
    const languagesId = categoryMap["Languages"];
    const historyId = categoryMap["History"];
    const csId = categoryMap["Computer Science"];

    // Define flashcard sets
    const flashcardSets = [
      {
        name: "Basic Algebra",
        description: "Fundamental algebraic concepts for beginners. Elementary",
        subject: "Mathematics",
        topic: "Algebra",
        category_id: mathId,
        is_built_in: true
      },
      {
        name: "Chemistry Elements",
        description: "Learn the periodic table elements. High School",
        subject: "Sciences",
        topic: "Chemistry",
        category_id: scienceId,
        is_built_in: true
      },
      {
        name: "English Grammar",
        description: "Essential English grammar rules. Elementary",
        subject: "Languages",
        topic: "English",
        category_id: languagesId,
        is_built_in: true
      },
      {
        name: "World History",
        description: "Key events in world history. High School",
        subject: "History",
        topic: "World",
        category_id: historyId,
        is_built_in: true
      },
      {
        name: "Advanced Physics",
        description: "Complex physics concepts for advanced students. Graduate",
        subject: "Sciences",
        topic: "Physics",
        category_id: scienceId,
        is_built_in: true
      },
      {
        name: "Programming Fundamentals",
        description: "Basic programming concepts. Undergraduate",
        subject: "Computer Science",
        topic: "Programming",
        category_id: csId,
        is_built_in: true
      }
    ];

    // Insert sets
    const { data: insertedSets, error } = await supabase
      .from('flashcard_sets')
      .insert(flashcardSets)
      .select();
    
    if (error) throw error;
    
    // Now, create flashcards for each set
    for (const set of insertedSets!) {
      await seedFlashcardsForSet(set.id, set.subject, set.topic);
    }
    
    return { success: true, message: "Flashcard sets and cards seeded successfully" };
  } catch (error) {
    console.error("Error seeding flashcard sets:", error);
    return { success: false, message: "Failed to seed flashcard sets" };
  }
};

const seedFlashcardsForSet = async (setId: string, subject: string | null, topic: string | null) => {
  try {
    let flashcards: any[] = [];
    
    // Define flashcards based on the set's subject
    if (subject === "Mathematics" && topic === "Algebra") {
      flashcards = [
        { front_content: "What is a variable?", back_content: "A symbol that represents a value which can change", difficulty: 1, is_built_in: true },
        { front_content: "Solve: x + 5 = 12", back_content: "x = 7", difficulty: 2, is_built_in: true },
        { front_content: "What is the quadratic formula?", back_content: "x = (-b ± √(b² - 4ac)) / 2a", difficulty: 3, is_built_in: true },
      ];
    } else if (subject === "Sciences" && topic === "Chemistry") {
      flashcards = [
        { front_content: "Symbol for Gold", back_content: "Au", difficulty: 1, is_built_in: true },
        { front_content: "Symbol for Oxygen", back_content: "O", difficulty: 1, is_built_in: true },
        { front_content: "Symbol for Sodium", back_content: "Na", difficulty: 2, is_built_in: true },
      ];
    } else if (subject === "Languages" && topic === "English") {
      flashcards = [
        { front_content: "What is a noun?", back_content: "A word used to identify people, places, or things", difficulty: 1, is_built_in: true },
        { front_content: "What is a verb?", back_content: "A word used to describe an action, state, or occurrence", difficulty: 1, is_built_in: true },
        { front_content: "What is an adverb?", back_content: "A word that modifies a verb, adjective, or other adverb", difficulty: 2, is_built_in: true },
      ];
    } else {
      // Default flashcards if no specific ones for this subject
      flashcards = [
        { front_content: `${subject} Term 1`, back_content: "Definition 1", difficulty: 1, is_built_in: true },
        { front_content: `${subject} Term 2`, back_content: "Definition 2", difficulty: 2, is_built_in: true },
        { front_content: `${subject} Term 3`, back_content: "Definition 3", difficulty: 3, is_built_in: true },
      ];
    }
    
    // Insert the flashcards
    const { data: insertedCards, error } = await supabase
      .from('flashcards')
      .insert(flashcards)
      .select();
    
    if (error) throw error;
    
    // Now connect flashcards to the set
    const setCards = insertedCards!.map((card, index) => ({
      flashcard_id: card.id,
      set_id: setId,
      position: index
    }));
    
    const { error: setCardsError } = await supabase
      .from('flashcard_set_cards')
      .insert(setCards);
    
    if (setCardsError) throw setCardsError;
    
    return true;
  } catch (error) {
    console.error(`Error seeding flashcards for set ${setId}:`, error);
    return false;
  }
};

// Function to run all seeds
export const runDatabaseSeed = async () => {
  const categoriesResult = await seedSubjectCategories();
  console.log(categoriesResult.message);
  
  const setsResult = await seedFlashcardSets();
  console.log(setsResult.message);
  
  return {
    categories: categoriesResult,
    sets: setsResult
  };
};
