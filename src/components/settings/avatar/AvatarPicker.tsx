import React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

import girl1 from '@/assets/avatars/girl-1.png';
import girl2 from '@/assets/avatars/girl-2.png';
import girl3 from '@/assets/avatars/girl-3.png';
import girl4 from '@/assets/avatars/girl-4.png';
import girl5 from '@/assets/avatars/girl-5.png';
import boy1 from '@/assets/avatars/boy-1.png';
import boy2 from '@/assets/avatars/boy-2.png';
import boy3 from '@/assets/avatars/boy-3.png';
import boy4 from '@/assets/avatars/boy-4.png';
import boy5 from '@/assets/avatars/boy-5.png';

interface AvatarOption {
  id: string;
  label: string;
  src: string;
}

const AVATARS: AvatarOption[] = [
  { id: 'girl1', label: 'Girl 1', src: girl1 },
  { id: 'girl2', label: 'Girl 2', src: girl2 },
  { id: 'girl3', label: 'Girl 3', src: girl3 },
  { id: 'girl4', label: 'Girl 4', src: girl4 },
  { id: 'girl5', label: 'Girl 5', src: girl5 },
  { id: 'boy1', label: 'Boy 1', src: boy1 },
  { id: 'boy2', label: 'Boy 2', src: boy2 },
  { id: 'boy3', label: 'Boy 3', src: boy3 },
  { id: 'boy4', label: 'Boy 4', src: boy4 },
  { id: 'boy5', label: 'Boy 5', src: boy5 },
];

interface AvatarPickerProps {
  value?: string;
  onChange: (value: string) => void;
}

export const AvatarPicker: React.FC<AvatarPickerProps> = ({ value, onChange }) => {
  const handleSelect = (src: string) => {
    onChange(src);
  };

  const isSelected = (src: string) => value === src;

  return (
    <div className="space-y-3">
      <Label className="text-sm">Profile Avatar</Label>
      <p className="text-xs text-muted-foreground">Choose an avatar or keep using your initials.</p>

      <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
        {AVATARS.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => handleSelect(a.src)}
            className={cn(
              'relative rounded-full p-0.5 ring-2 transition focus:outline-none focus:ring-primary',
              isSelected(a.src) ? 'ring-primary' : 'ring-transparent hover:ring-muted'
            )}
            aria-label={`Select ${a.label} avatar`}
          >
            <img
              src={a.src}
              alt={`${a.label} anime avatar`}
              loading="lazy"
              className="h-12 w-12 rounded-full object-cover"
            />
          </button>
        ))}
      </div>

      <div className="flex gap-2 pt-1">
        <Button
          type="button"
          variant="secondary"
          onClick={() => onChange('')}
          aria-label="Use initials instead of an avatar"
        >
          Use initials
        </Button>
      </div>
    </div>
  );
};
