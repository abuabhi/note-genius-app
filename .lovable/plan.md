# Fix: Quiz answers always land at position A

## What's happening

This is a **bug**, not coincidence. The `generate-quiz` edge function asks the AI to return options + a `correctAnswer` index, and the prompt's example uses `"correctAnswer": 0`. With temperature 0.3, the model consistently anchors to that pattern and returns `0` for most/all questions. Options are then stored in the database in the exact order the AI returned them, so the correct answer always shows up as the first choice (A).

There is no shuffling anywhere in the pipeline — not in the edge function, not in `useNoteToQuizState`, not in `useCreateQuiz`.

## Fix

**Shuffle option order server-side** in `supabase/functions/generate-quiz/index.ts`, right after validation, before returning the response:

- For each validated question, take the correct option (using `correctAnswer` index), shuffle the 4 options with `Math.random()`, then recompute `correctAnswer` to point at the new index of the originally correct option.
- This guarantees a roughly uniform distribution across A/B/C/D regardless of what the model returns.

**Also tighten the prompt** to reduce model bias:
- Remove the "correctAnswer": 0 example (use `2` or vary it) and add an explicit instruction: "Vary the position of the correct answer across questions — do not bias toward index 0."

## Technical details

In `supabase/functions/generate-quiz/index.ts`, inside the `.map((q: any) => {...})` validation block (around line 245), before returning the question object:

```ts
// Shuffle options so correct answer isn't always at index 0
const correctOption = options[q.correctAnswer];
const shuffled = [...options];
for (let i = shuffled.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
}
const newCorrectIndex = shuffled.indexOf(correctOption);
return { question, options: shuffled, correctAnswer: newCorrectIndex, explanation };
```

Plus update the prompt example in `buildPrompt` to use a non-zero `correctAnswer` and add the variation instruction.

## Scope

- 1 file: `supabase/functions/generate-quiz/index.ts`
- No DB changes, no frontend changes
- Existing quizzes already in the DB are unaffected (they keep their current ordering); only newly generated quizzes get the fix.
