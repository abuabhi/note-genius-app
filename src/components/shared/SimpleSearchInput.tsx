import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SimpleSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SimpleSearchInput = React.memo(({ 
  value, 
  onChange, 
  placeholder = "Search...", 
  className 
}: SimpleSearchInputProps) => {
  console.log('🔍 [SIMPLE SEARCH] Rendering with value:', value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log('🔍 [SIMPLE SEARCH] Input changed to:', newValue);
    onChange(newValue);
  };

  const clearInput = () => {
    console.log('🔍 [SIMPLE SEARCH] Clearing input');
    onChange('');
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mint-400" />
      <Input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={`pl-10 pr-10 border-mint-200 focus-visible:ring-mint-400 ${className || ''}`}
        autoComplete="off"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
          onClick={clearInput}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
});

SimpleSearchInput.displayName = 'SimpleSearchInput';