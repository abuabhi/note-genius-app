
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Send } from 'lucide-react';
import { useCreateFeedback } from '@/hooks/feedback/useFeedback';
import { cn } from '@/lib/utils';

export const RatingFeedback = () => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const createFeedback = useCreateFeedback();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      return;
    }

    await createFeedback.mutateAsync({
      type: 'rating',
      title: `${rating}-star rating`,
      description: comment || undefined,
      rating,
    });

    // Reset form
    setRating(0);
    setComment('');
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return '';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <Label className="text-lg font-semibold text-foreground">
          How would you rate your overall experience?
        </Label>
        
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="transition-transform hover:scale-110"
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(star)}
            >
              <Star
                className={cn(
                  "h-8 w-8 transition-colors",
                  (hoveredRating >= star || rating >= star)
                    ? "fill-amber-400 text-amber-400"
                    : "text-gray-300"
                )}
              />
            </button>
          ))}
          {(rating > 0 || hoveredRating > 0) && (
            <span className="ml-3 text-lg font-medium text-foreground">
              {getRatingText(hoveredRating || rating)}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment" className="text-foreground">
          Tell us more about your experience (optional)
        </Label>
        <Textarea
          id="comment"
          placeholder="What did you like? What could be improved? Any specific features you'd like to see?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="min-h-[120px]"
        />
      </div>

      <Button
        type="submit"
        disabled={rating === 0 || createFeedback.isPending}
        className="w-full py-3"
      >
        <Send className="h-4 w-4 mr-2" />
        {createFeedback.isPending ? 'Submitting...' : 'Submit Rating'}
      </Button>
    </form>
  );
};
