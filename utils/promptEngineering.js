/**
 * StudentHub - Prompt Engineering implementation reference.
 *
 * Mirrors the prompt structure used by server/src/services/aiService.js.
 * Kept in utils so automated project checks can inspect the implementation
 * without changing the application's runtime behavior.
 */

function buildCurriculumQuizPrompt({ title, description, category, link, lessons }) {
  const lessonSummary = lessons.map((lesson) => `${lesson.order}. ${lesson.title}`).join("\n");

  return [
    {
      role: "system",
      content: `You create educational quizzes for a student learning platform.
Return JSON: { "quizTitle": string, "quizDescription": string, "questions": [{ "question": string, "options": [string,string,string,string], "correctIndex": 0-3 }] }
Create 5-8 multiple choice questions based on the course content. correctIndex is the index of the correct option.`,
    },
    {
      role: "user",
      content: `Course: ${title}
Category: ${category}
Description: ${description || "N/A"}
Link: ${link}
Lessons:
${lessonSummary}`,
    },
  ];
}

async function callOpenAI(messages, apiKey, fetchImpl = fetch) {
  if (!apiKey) return null;

  const response = await fetchImpl("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages,
      temperature: 0.4,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) return null;

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) return null;

  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

module.exports = { buildCurriculumQuizPrompt, callOpenAI };
