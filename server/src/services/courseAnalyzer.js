const { parseYouTubeUrl, fetchYouTubePlaylist, fetchYouTubeVideo, buildVideoUrl } = require("../utils/youtube");
const {
  fallbackLessons,
  fallbackQuiz,
  generateCurriculumAndQuiz,
  generateLessonsWithAI,
  refineLessonTitles,
} = require("./aiService");

async function analyzeCourseLink({ title, description, category, link }) {
  const parsed = parseYouTubeUrl(link);
  let lessons = null;
  let source = "fallback";

  if (parsed.type === "playlist" && parsed.playlistId) {
    lessons = await fetchYouTubePlaylist(parsed.playlistId);
    if (lessons?.length) source = "youtube_api";
  }

  if (parsed.type === "video" && parsed.videoId && !lessons?.length) {
    const videoLesson = await fetchYouTubeVideo(parsed.videoId);
    if (videoLesson) {
      lessons = [videoLesson];
      source = "youtube_api";
    }
  }

  if (!lessons?.length && process.env.OPENAI_API_KEY) {
    lessons = await generateLessonsWithAI({ title, description, category, link, parsed });
    if (lessons?.length) source = "openai_curriculum";
  }

  if (!lessons?.length) {
    lessons = fallbackLessons({ title, link, parsed });
    source = parsed.type === "playlist" ? "playlist_heuristic" : "link_heuristic";
  }

  if (parsed.type === "video" && parsed.videoId && lessons.length === 1) {
    lessons[0].videoUrl = buildVideoUrl(parsed.videoId, parsed.playlistId);
  }

  if (process.env.OPENAI_API_KEY) {
    lessons = await refineLessonTitles({ title, description, lessons });
    source += "+ai_titles";
  }

  let quiz = fallbackQuiz({ title, lessons });

  if (process.env.OPENAI_API_KEY) {
    quiz = await generateCurriculumAndQuiz({ title, description, category, link, lessons });
    source += "+ai_quiz";
  }

  return { lessons, quiz, source, parsed };
}

module.exports = { analyzeCourseLink };
