
// Inside the component's useEffect:
useEffect(() => {
  const loadSets = async () => {
    setLoading(true);
    try {
      const sets = await fetchBuiltInSets();
      setSets(sets);
    } catch (error) {
      console.error("Error loading library sets:", error);
      setSets([]);
    } finally {
      setLoading(false);
    }
  };
  
  loadSets();
}, [fetchBuiltInSets]);
