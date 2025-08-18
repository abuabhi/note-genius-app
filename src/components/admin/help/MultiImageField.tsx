import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Plus, MoveUp, MoveDown } from 'lucide-react';

interface MultiImageFieldProps {
  label: string;
  images: string[];
  onChange: (images: string[]) => void;
}

export const MultiImageField: React.FC<MultiImageFieldProps> = ({
  label,
  images,
  onChange
}) => {
  const addImage = () => {
    onChange([...images, '']);
  };

  const updateImage = (index: number, url: string) => {
    const newImages = [...images];
    newImages[index] = url;
    onChange(newImages);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === images.length - 1)
    ) {
      return;
    }

    const newImages = [...images];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      <Label>{label}</Label>
      
      {images.map((image, index) => (
        <div key={index} className="flex gap-2 items-start">
          <div className="flex-1">
            <Input
              value={image}
              onChange={(e) => updateImage(index, e.target.value)}
              placeholder="Enter image URL"
              className="w-full"
            />
            {image && (
              <img 
                src={image} 
                alt={`Preview ${index + 1}`} 
                className="mt-2 h-20 w-20 object-cover rounded border"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
          </div>
          
          <div className="flex gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => moveImage(index, 'up')}
              disabled={index === 0}
            >
              <MoveUp className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => moveImage(index, 'down')}
              disabled={index === images.length - 1}
            >
              <MoveDown className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => removeImage(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
      
      <Button
        type="button"
        variant="outline"
        onClick={addImage}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Image
      </Button>
    </div>
  );
};