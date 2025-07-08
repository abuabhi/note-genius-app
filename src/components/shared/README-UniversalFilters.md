# Universal Filter System

## Overview
The Universal Filter System provides consistent, high-performance search/filter/sort functionality across Notes, Flashcards, and Quiz pages.

## Key Features
- ✅ **300ms Search Debouncing** - Prevents excessive API calls
- ✅ **Instant UI Updates** - Search input responds immediately
- ✅ **Consistent Design** - Same look and feel across all pages  
- ✅ **Smart Caching** - Efficient React Query integration
- ✅ **Active Filter Indicators** - Clear visual feedback
- ✅ **One-Click Clear All** - Quick filter reset

## Components

### 1. `useUniversalFilters` Hook
```typescript
const filters = useUniversalFilters({
  defaultSort: 'newest',
  enableArchived: true,
  debounceMs: 300
});
```

### 2. `UniversalFilters` Component
```typescript
<UniversalFilters
  search={search}
  subject={subject}
  sort={sort}
  onSearchChange={setSearch}
  onSubjectChange={setSubject}
  onSortChange={setSort}
  subjects={subjects}
  sortOptions={sortOptions}
  searchPlaceholder="Search..."
  hasActiveFilters={hasActiveFilters}
  activeFilterCount={activeFilterCount}
  onClearFilters={clearFilters}
/>
```

## Implementation Examples

### Notes Page
```typescript
// Uses debounced search with instant UI feedback
const OptimizedNotesFilters = () => {
  const [localSearch, setLocalSearch] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch]);
  
  return <UniversalFilters search={localSearch} onSearchChange={setLocalSearch} />;
};
```

### Quiz/Flashcard Pages
```typescript
// Uses the universal hook directly
const EnhancedQuizFilters = () => {
  const filters = useUniversalFilters({ debounceMs: 300 });
  
  useEffect(() => {
    onFiltersChange({
      search: filters.debouncedSearch,
      subject: filters.subject
    });
  }, [filters.debouncedSearch, filters.subject]);
  
  return <UniversalFilters {...filters} />;
};
```

## Performance Benefits
- **Reduced API Calls**: 300ms debouncing prevents excessive requests
- **Instant UI**: Search input updates immediately for better UX
- **Efficient Caching**: Query keys designed for optimal React Query caching
- **Consistent State**: Single source of truth for filter logic

## Migration Guide
Replace existing filter components:
1. Import `UniversalFilters` and `useUniversalFilters`
2. Configure sort options for your page
3. Connect to your existing query hooks
4. Remove old filter components

## Fixes Applied
- ✅ Fixed Notes sort mapping (`recent` → `newest`)
- ✅ Fixed subject filtering (handles both `subject` and `subject_id`)
- ✅ Added search debouncing across all pages
- ✅ Unified filter UI components
- ✅ Consistent active filter indicators
- ✅ Improved query key caching