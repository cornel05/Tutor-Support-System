import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Feedback } from '../types';

const schema = z.object({
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().min(5).max(300),
});

type FeedbackFormProps = {
  defaultValue?: Feedback;
  onSubmit: (data: Feedback) => void;
  sessionId: number;
};

export function FeedbackForm({ defaultValue, onSubmit, sessionId }: FeedbackFormProps) {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    watch,
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      rating: defaultValue?.rating ?? 5,
      comment: defaultValue?.comment ?? '',
    },
  });

  const rating = watch('rating');

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit((values) =>
        onSubmit({
          sessionId,
          rating: Number(values.rating),
          comment: values.comment,
          submittedAt: new Date().toISOString(),
        })
      )}
    >
      <div className="space-y-2">
        <Label htmlFor="rating">Rating: {rating} ⭐</Label>
        <input
          id="rating"
          type="range"
          min={1}
          max={5}
          step={1}
          className="w-full accent-brand"
          {...register('rating')}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="comment">Reflection</Label>
        <Textarea id="comment" placeholder="What went well? What should we improve?" {...register('comment')} />
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Saving...' : 'Submit feedback'}
      </Button>
    </form>
  );
}
