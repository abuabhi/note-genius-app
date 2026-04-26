## Add Exam dialog cleanup

Update `src/components/exam-prep/ExamFormDialog.tsx`:

1. **Remove Location field** entirely (UI + state + payload sends `location: null`).
2. **Add Topic field (optional)** — single-line text. On submit, if filled, insert into `exam_topics` (the existing topics table) so it shows up on the exam detail page. Hint text: "You can add more topics after creating the exam."
3. **Exam date — date only**: change input from `type="datetime-local"` to `type="date"`. Store as start-of-day ISO (`new Date(\`${examDate}T00:00:00\`).toISOString()`).
4. **Notes labeled optional** — append small "(optional)" hint next to label. (Field is already not required in validation.)
5. **Layout**: with Location gone, place Exam date and Target readiness side-by-side; Topic and Notes each get their own full-width row.

Required fields remain: Title, Exam date. Submit button stays disabled until both are filled.

## Files changed

- `src/components/exam-prep/ExamFormDialog.tsx`
