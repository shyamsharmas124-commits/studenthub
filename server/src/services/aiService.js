const { parseYouTubeUrl, buildVideoUrl } = require("../utils/youtube");

function fallbackLessons({ title, link, parsed }) {
  if (parsed.type === "playlist") {
    const count = 8;
    return Array.from({ length: count }, (_, i) => ({
      order: i + 1,
      title: `${title} — Lesson ${i + 1}`,
      videoUrl: link,
      duration: null,
    }));
  }

  if (parsed.type === "video" && parsed.videoId) {
    return [{
      order: 1,
      title: title || "Introduction",
      videoUrl: buildVideoUrl(parsed.videoId, parsed.playlistId),
      duration: null,
    }];
  }

  return [
    { order: 1, title: "Getting Started", videoUrl: link, duration: null },
    { order: 2, title: "Core Concepts", videoUrl: link, duration: null },
    { order: 3, title: "Hands-on Practice", videoUrl: link, duration: null },
    { order: 4, title: "Review & Next Steps", videoUrl: link, duration: null },
  ];
}

function fallbackQuiz({ title, lessons }) {
  const lessonTitles = lessons.slice(0, 5).map((l) => l.title);

  const questions = lessonTitles.map((lessonTitle, i) => ({
    question: `Which topic does "${lessonTitle}" cover in ${title}?`,
    options: [
      lessonTitle,
      lessonTitles[(i + 1) % lessonTitles.length] || "Advanced topics",
      "Unrelated content",
      "Course introduction only",
    ],
  }));

  if (questions.length < 3) {
    questions.push({
      question: `What is the main subject of "${title}"?`,
      options: [title, "General knowledge", "Unrelated field", "None of the above"],
    });
  }

  const answers = questions.map((_, i) => 0);

  return {
    title: `${title} — Knowledge Check`,
    description: "Auto-generated quiz based on the course curriculum.",
    questions,
    answers,
  };
}

async function callOpenAI(messages) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
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

  if (!response.ok) {
    console.log("OpenAI error:", await response.text());
    return null;
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) return null;

  return JSON.parse(content);
}

async function generateCurriculumAndQuiz({ title, description, category, link, lessons }) {
  const lessonSummary = lessons.map((l) => `${l.order}. ${l.title}`).join("\n");

  const result = await callOpenAI([
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
  ]);

  if (!result?.questions?.length) {
    return fallbackQuiz({ title, lessons });
  }

  const questions = result.questions.map((q) => ({
    question: q.question,
    options: q.options,
  }));

  const answers = result.questions.map((q) => q.correctIndex ?? 0);

  return {
    title: result.quizTitle || `${title} — Knowledge Check`,
    description: result.quizDescription || "AI-generated quiz for this course.",
    questions,
    answers,
  };
}

async function generateLessonsWithAI({ title, description, category, link, parsed }) {
  const result = await callOpenAI([
    {
      role: "system",
      content: `You build course curricula from external learning links.
Return JSON: { "lessons": [{ "order": number, "title": string, "videoUrl": string }] }
Create one lesson per video in a playlist when the link is a YouTube playlist, otherwise 4-8 logical modules.
Each lesson needs a title and videoUrl (use the course link or derive plausible YouTube watch URLs when possible).`,
    },
    {
      role: "user",
      content: `Course: ${title}
Category: ${category}
Description: ${description || "N/A"}
Link: ${link}
Link type: ${parsed.type}`,
    },
  ]);

  if (!result?.lessons?.length) return null;

  return result.lessons.map((lesson, index) => ({
    order: lesson.order ?? index + 1,
    title: lesson.title,
    videoUrl: lesson.videoUrl || link,
    duration: null,
  }));
}

async function refineLessonTitles({ title, description, lessons }) {
  const result = await callOpenAI([
    {
      role: "system",
      content: `Improve lesson titles for an online course. Return JSON: { "lessons": [{ "order": number, "title": string }] }
Keep the same number of lessons and order. Make titles clear and professional.`,
    },
    {
      role: "user",
      content: `Course: ${title}\nDescription: ${description || "N/A"}\nLessons: ${JSON.stringify(lessons.map((l) => ({ order: l.order, title: l.title })))}`,
    },
  ]);

  if (!result?.lessons?.length) return lessons;

  return lessons.map((lesson) => {
    const improved = result.lessons.find((l) => l.order === lesson.order);
    return improved ? { ...lesson, title: improved.title } : lesson;
  });
}

module.exports = {
  fallbackLessons,
  fallbackQuiz,
  generateCurriculumAndQuiz,
  generateLessonsWithAI,
  refineLessonTitles,
};
