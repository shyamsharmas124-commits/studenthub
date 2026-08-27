# Prompt Engineering — Applied in This Codebase

Quick reference tying prompt engineering practices to the AI-generation code
in `server/src/services/aiService.js`, for onboarding or interview prep.

## Where it's used

`aiService.js` calls OpenAI's chat completions API in three places:

- `generateLessonsWithAI` — turns a course link + metadata into a lesson list.
- `generateCurriculumAndQuiz` — turns a course's lessons into a multiple-choice quiz.
- `refineLessonTitles` — cleans up auto-generated lesson titles.

Each of these is a small, focused prompt rather than one large "do
everything" prompt — smaller, single-purpose prompts are easier to validate,
easier to fall back from when they fail, and produce more consistent output
than asking a model to juggle several unrelated tasks in one call.

## System vs. user message separation

Every call splits instructions from data:

```js
{ role: "system", content: `You build course curricula from external learning links.
Return JSON: { "lessons": [...] }
Create one lesson per video in a playlist... otherwise 4-8 logical modules.` },
{ role: "user", content: `Course: ${title}\nCategory: ${category}\n...` }
```

The `system` message carries the fixed instructions — the task, the output
contract, the rules — and never changes between calls. The `user` message
carries only the per-request data (course title, description, lesson list).
This separation matters for two reasons: it keeps the instructions from
being diluted or reinterpreted alongside variable data, and it means the
"prompt" (system message) can be reviewed, versioned, and tested independently
of any one course's content.

## Constraining the output shape

Every prompt in this file spells out an exact JSON shape it expects back —
e.g. `{ "lessons": [{ "order": number, "title": string, "videoUrl": string }] }`
— combined with `response_format: { type: "json_object" }` in the API call
(`callOpenAI`). This is a deliberate way to make an inherently unstructured
tool (a language model) produce something a normal JS function can rely on:
instead of parsing free-text and hoping for the best, the code does a
straight `JSON.parse` and treats the result like any other API response. The
prompts also constrain the *content*, not just the shape — e.g. "correctIndex
is the index of the correct option" removes ambiguity about what a field
means, and "Keep the same number of lessons and order" in
`refineLessonTitles` stops the model from silently adding, dropping, or
reordering lessons when it was only asked to retitle them.

## Grounding the model in real data

Rather than asking the model to invent a course from a category name alone,
each prompt passes in the actual lesson titles, description, and link
(`lessonSummary` in `generateCurriculumAndQuiz`, `parsed.type` in
`generateLessonsWithAI`). This keeps generations grounded in content that
already exists in the database instead of hallucinated from the category
name alone, and it's why the quiz questions reference specific lesson
titles rather than generic placeholders.

## Designing for failure: fallbacks, not crashes

Every AI call in this codebase has a matching deterministic fallback —
`fallbackLessons` and `fallbackQuiz` — and `callOpenAI` returns `null` on any
failure (missing API key, non-OK response, unparseable content) rather than
throwing. The calling functions check for that `null`/empty result and fall
back to template-based generation instead of failing the request. This
means a prompt change, a model outage, or a malformed response degrades the
feature to "generic but working" rather than breaking course creation
entirely — an important property for a prompt whose output feeds directly
into stored data.
