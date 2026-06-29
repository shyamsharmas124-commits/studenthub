require("dotenv").config();

const required = ["DATABASE_URL", "JWT_SECRET"];

function missingRequired() {
  return required.filter((key) => !process.env[key]?.trim());
}

function integrationStatus() {
  const youtube = Boolean(process.env.YOUTUBE_API_KEY?.trim());
  const openai = Boolean(process.env.OPENAI_API_KEY?.trim());

  return {
    youtube: {
      configured: youtube,
      feature: "Real YouTube playlist titles and per-video links",
    },
    openai: {
      configured: openai,
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      feature: "AI lesson titles and auto-generated quizzes",
    },
    fallback: {
      active: !youtube || !openai,
      note: "Courses still work without keys — heuristics are used for anything missing.",
    },
  };
}

function logStartupStatus() {
  const missing = missingRequired();
  if (missing.length) {
    console.warn(`Missing required env: ${missing.join(", ")}`);
  }

  const status = integrationStatus();
  console.log(
    `Integrations — YouTube: ${status.youtube.configured ? "ready" : "not set"}, OpenAI: ${status.openai.configured ? "ready" : "not set"}`
  );
}

module.exports = {
  missingRequired,
  integrationStatus,
  logStartupStatus,
};
