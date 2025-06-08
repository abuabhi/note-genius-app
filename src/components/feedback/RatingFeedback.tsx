
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Send, Sparkles } from 'lucide-react';
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

  const getRatingColor = (rating: number) => {
    switch (rating) {
      case 1: return 'text-red-500';
      case 2: return 'text-orange-500';
      case 3: return 'text-yellow-500';
      case 4: return 'text-mint-500';
      case 5: return 'text-mint-600';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gradient-to-br from-mint-50/50 to-white rounded-lg p-6 border border-mint-100">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6">
          <div className="text-center">
            <Label className="text-xl font-semibold text-mint-800 flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-mint-500" />
              How would you rate your overall experience?
            </Label>
            <p className="text-sm text-muted-foreground mt-2">
              Your rating helps us understand what we're doing right
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="transition-all duration-200 hover:scale-125 focus:outline-none focus:ring-2 focus:ring-mint-400 focus:ring-offset-2 rounded-full p-1"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={cn(
                      "h-10 w-10 transition-all duration-200",
                      (hoveredRating >= star || rating >= star)
                        ? "fill-mint-400 text-mint-400 drop-shadow-md"
                        : "text-gray-300 hover:text-mint-300"
                    )}
                  />
                </button>
              ))}
            </div>
            {(rating > 0 || hoveredRating > 0) && (
              <div className="text-center">
                <span className={cn(
                  "text-lg font-semibold",
                  getRatingColor(hoveredRating || rating)
                )}>
                  {getRatingText(hoveredRating || rating)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="comment" className="text-mint-800 font-medium">
            Tell us more about your experience (optional)
          </Label>
          <Textarea
            id="comment"
            placeholder="What did you like? What could be improved? Any specific features you'd like to see?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[120px] border-mint-200 focus:border-mint-400 focus:ring-mint-400 bg-white"
          />
        </div>

        <Button
          type="submit"
          disabled={rating === 0 || createFeedback.isPending}
          className="w-full py-4 bg-gradient-to-r from-mint-500 to-mint-600 hover:from-mint-600 hover:to-mint-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Send className="h-4 w-4 mr-2" />
          {createFeedback.isPending ? 'Submitting...' : 'Submit Rating'}
        </Button>
      </form>
    </div>
  );
};
