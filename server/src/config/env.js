require("dotenv").config();

const required = ["DATABASE_URL", "JWT_SECRET"];

function missingRequired() {
  return required.filter((key) => !process.env[key]?.trim());
}

function integrationStatus() {
  const youtube = Boolean(process.env.YOUTUBE_API_KEY?.trim());
  const openai = Boolean(process.env.OPENAI_API_KEY?.trim());
  const redis = Boolean(process.env.REDIS_URL?.trim());
  const stripe = Boolean(process.env.STRIPE_SECRET_KEY?.trim());

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
    redis: {
      configured: redis,
      feature: "Cached leaderboard/analytics reads (falls back to in-memory cache without it)",
    },
    stripe: {
      configured: stripe,
      feature: "Platform-support checkout that funds sponsored coupons",
    },
    fallback: {
      active: !youtube || !openai || !redis || !stripe,
      note: "Courses still work without keys — heuristics/in-memory fallbacks are used for anything missing.",
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
