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
  { id: 'aditya-gupta', label: 'Aditya Gupta', src: '/lovable-uploads/avatars/aditya-gupta.png?v=1', fallbackSrc: girl1 },
  { id: 'arjun-patel', label: 'Arjun Patel', src: '/lovable-uploads/avatars/arjun-patel.png?v=1', fallbackSrc: girl2 },
  { id: 'dev-singh', label: 'Dev Singh', src: '/lovable-uploads/avatars/dev-singh.png?v=1', fallbackSrc: girl3 },
  { id: 'emma-liu', label: 'Emma Liu', src: '/lovable-uploads/avatars/emma-liu.png?v=1', fallbackSrc: girl4 },
  { id: 'jessica-zhang', label: 'Jessica Zhang', src: '/lovable-uploads/avatars/jessica-zhang.png?v=1', fallbackSrc: girl5 },
  { id: 'lily-wang', label: 'Lily Wang', src: '/lovable-uploads/avatars/lily-wang.png?v=1', fallbackSrc: girl6 },
  { id: 'priya-sharma', label: 'Priya Sharma', src: '/lovable-uploads/avatars/priya-sharma.png?v=1', fallbackSrc: girl7 },
  { id: 'ravi-kumar', label: 'Ravi Kumar', src: '/lovable-uploads/avatars/ravi-kumar.png?v=1', fallbackSrc: girl8 },
  { id: 'wei-chen', label: 'Wei Chen', src: '/lovable-uploads/avatars/wei-chen.png?v=1', fallbackSrc: girl9 },
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
