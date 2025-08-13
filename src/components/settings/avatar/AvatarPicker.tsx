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

interface AvatarOption {
  id: string;
  label: string;
  src: string; // public URL under /lovable-uploads
  fallbackSrc?: string; // bundled fallback image
}

const AVATARS: AvatarOption[] = [
  { id: 'avatar-01', label: 'Avatar 01', src: '/lovable-uploads/avatars/avatar-01.png?v=3', fallbackSrc: girl1 },
  { id: 'avatar-02', label: 'Avatar 02', src: '/lovable-uploads/avatars/avatar-02.png?v=3', fallbackSrc: girl2 },
  { id: 'avatar-03', label: 'Avatar 03', src: '/lovable-uploads/avatars/avatar-03.png?v=3', fallbackSrc: girl3 },
  { id: 'avatar-04', label: 'Avatar 04', src: '/lovable-uploads/avatars/avatar-04.png?v=3', fallbackSrc: girl4 },
  { id: 'avatar-05', label: 'Avatar 05', src: '/lovable-uploads/avatars/avatar-05.png?v=3', fallbackSrc: girl5 },
  { id: 'avatar-06', label: 'Avatar 06', src: '/lovable-uploads/avatars/avatar-06.png?v=3', fallbackSrc: girl6 },
  { id: 'avatar-07', label: 'Avatar 07', src: '/lovable-uploads/avatars/avatar-07.png?v=3', fallbackSrc: girl7 },
  { id: 'avatar-08', label: 'Avatar 08', src: '/lovable-uploads/avatars/avatar-08.png?v=3', fallbackSrc: girl8 },
  { id: 'avatar-09', label: 'Avatar 09', src: '/lovable-uploads/avatars/avatar-09.png?v=3', fallbackSrc: girl9 },
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
              onError={(e) => {
                if (a.fallbackSrc) {
                  (e.currentTarget as HTMLImageElement).src = a.fallbackSrc;
                }
              }}
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
