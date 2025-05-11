
// Inside the component where cloneFlashcardSet is called:
const handleClone = async () => {
  if (!user) {
    toast("Please sign in to clone this set");
    return;
  }
  
  try {
    setIsCloning(true);
    const clonedSet = await cloneFlashcardSet(set.id);
    if (clonedSet) {
      toast.success("Set cloned successfully!");
      // Navigate to the flashcards page or the cloned set
    }
  } catch (error) {
    console.error("Error cloning set:", error);
    toast.error("Failed to clone set");
  } finally {
    setIsCloning(false);
  }
};
