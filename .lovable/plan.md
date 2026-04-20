
User wants two things:
1. Split the large chunks (NoteStudyPage 594 KB, index 1.2 MB) flagged in the last build.
2. A step-by-step walkthrough to run the k6 load test — they've never used k6 before.

For #1, I need to look at the current vite chunking and the heaviest pages to plan splits. For #2, k6 is a CLI tool that can't run inside the Lovable sandbox preview — it must run on the user's own machine (or CI). I'll give a beginner-friendly walkthrough.

Let me keep the plan tight and actionable.
