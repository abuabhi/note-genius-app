import React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

import girl1 from '@/assets/avatars/girl-1.png';
import girl2 from '@/assets/avatars/girl-2.png';
import girl3 from '@/assets/avatars/girl-3.png';
import girl4 from '@/assets/avatars/girl-4.png';
import girl5 from '@/assets/avatars/girl-5.png';
import girl6 from '@/assets/avatars/girl-6.png';
import girl7 from '@/assets/avatars/girl-7.png';
import girl8 from '@/assets/avatars/girl-8.png';
import girl9 from '@/assets/avatars/girl-9.png';
import girl10 from '@/assets/avatars/girl-10.png';
import boy1 from '@/assets/avatars/boy-1.png';
import boy2 from '@/assets/avatars/boy-2.png';
import boy3 from '@/assets/avatars/boy-3.png';
import boy4 from '@/assets/avatars/boy-4.png';
import boy5 from '@/assets/avatars/boy-5.png';
import boy6 from '@/assets/avatars/boy-6.png';
import boy7 from '@/assets/avatars/boy-7.png';
import boy8 from '@/assets/avatars/boy-8.png';
import boy9 from '@/assets/avatars/boy-9.png';
import boy10 from '@/assets/avatars/boy-10.png';

interface AvatarOption {
  id: string;
  label: string;
  src: string; // bundled avatar image
}

const AVATARS: AvatarOption[] = [
  { id: 'girl-1', label: 'Avatar Option 1', src: girl1 },
  { id: 'girl-2', label: 'Avatar Option 2', src: girl2 },
  { id: 'girl-3', label: 'Avatar Option 3', src: girl3 },
  { id: 'girl-4', label: 'Avatar Option 4', src: girl4 },
  { id: 'girl-5', label: 'Avatar Option 5', src: girl5 },
  { id: 'girl-6', label: 'Avatar Option 6', src: girl6 },
  { id: 'girl-7', label: 'Avatar Option 7', src: girl7 },
  { id: 'girl-8', label: 'Avatar Option 8', src: girl8 },
  { id: 'girl-9', label: 'Avatar Option 9', src: girl9 },
  { id: 'girl-10', label: 'Avatar Option 10', src: girl10 },
  { id: 'boy-1', label: 'Avatar Option 11', src: boy1 },
  { id: 'boy-2', label: 'Avatar Option 12', src: boy2 },
  { id: 'boy-3', label: 'Avatar Option 13', src: boy3 },
  { id: 'boy-4', label: 'Avatar Option 14', src: boy4 },
  { id: 'boy-5', label: 'Avatar Option 15', src: boy5 },
  { id: 'boy-6', label: 'Avatar Option 16', src: boy6 },
  { id: 'boy-7', label: 'Avatar Option 17', src: boy7 },
  { id: 'boy-8', label: 'Avatar Option 18', src: boy8 },
  { id: 'boy-9', label: 'Avatar Option 19', src: boy9 },
  { id: 'boy-10', label: 'Avatar Option 20', src: boy10 },
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
              alt={`${a.label} avatar image`}
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
