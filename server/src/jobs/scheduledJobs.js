// Scheduled/background jobs. Additive: nothing here is called by any request
// handler, so if `node-cron` isn't installed the server still starts and every
// existing route keeps working — you just don't get the background sweeps.
const prisma = require("../utils/prisma");

async function pruneOldReadNotifications() {
  const THIRTY_DAYS_AGO = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const result = await prisma.notification.deleteMany({
    where: { read: true, createdAt: { lt: THIRTY_DAYS_AGO } },
  });
  if (result.count) {
    console.log(`[cron] Pruned ${result.count} read notification(s) older than 30 days`);
  }
}

async function recomputeTrendingCache() {
  // Cheap warm-up: touches the same aggregation used by getTrendingCourses
  // (see analyticsController.getCategoryLeaderboard) so the first request of
  // the day isn't the one paying the aggregation cost.
  try {
    const { warmTrendingCache } = require("../controllers/analyticsController");
    if (typeof warmTrendingCache === "function") {
      await warmTrendingCache();
      console.log("[cron] Warmed trending-courses cache");
    }
  } catch (err) {
    console.log("[cron] Trending cache warm-up skipped:", err.message);
  }
}

function startScheduledJobs() {
  let cron;
  try {
    cron = require("node-cron");
  } catch (err) {
    console.warn("node-cron not installed — scheduled jobs disabled. Run `npm install` to enable.");
    return;
  }

  // Every day at 03:00 server time — low traffic hour, safe to do cleanup work
  cron.schedule("0 3 * * *", () => {
    pruneOldReadNotifications().catch((err) => console.error("[cron] prune job failed:", err));
  });

  // Every 30 minutes — keeps the trending/leaderboard cache warm
  cron.schedule("*/30 * * * *", () => {
    recomputeTrendingCache().catch((err) => console.error("[cron] trending warm-up failed:", err));
  });

  console.log("Scheduled jobs registered (daily notification prune, 30-min trending warm-up)");
}

module.exports = { startScheduledJobs, pruneOldReadNotifications, recomputeTrendingCache };
