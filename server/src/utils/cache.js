// Caching layer: uses Redis when REDIS_URL is configured, otherwise falls
// back to a simple in-process Map. Every existing endpoint keeps working
// with no Redis at all — this is purely an opt-in speed-up for expensive
// read endpoints (course listing, leaderboards), never required for
// correctness. See README/DEPLOYMENT.md for how to provision Redis.

const memoryStore = new Map();
let redisClient = null;
let redisReady = false;

function getRedis() {
  if (redisClient) return redisClient;
  if (!process.env.REDIS_URL) return null;

  try {
    const Redis = require("ioredis");
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      lazyConnect: false,
    });
    redisClient.on("connect", () => {
      redisReady = true;
      console.log("Redis cache connected");
    });
    redisClient.on("error", (err) => {
      redisReady = false;
      console.warn("Redis error (falling back to in-memory cache):", err.message);
    });
    return redisClient;
  } catch (err) {
    console.warn("ioredis not installed — using in-memory cache only. Run `npm install` to enable Redis.");
    return null;
  }
}

async function cacheGet(key) {
  const client = getRedis();
  if (client && redisReady) {
    try {
      const raw = await client.get(key);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      // fall through to memory store
    }
  }
  const entry = memoryStore.get(key);
  if (!entry) return null;
  if (entry.expiresAt && entry.expiresAt < Date.now()) {
    memoryStore.delete(key);
    return null;
  }
  return entry.value;
}

async function cacheSet(key, value, ttlSeconds = 300) {
  const client = getRedis();
  if (client && redisReady) {
    try {
      await client.set(key, JSON.stringify(value), "EX", ttlSeconds);
      return;
    } catch (err) {
      // fall through to memory store
    }
  }
  memoryStore.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

async function cacheDel(key) {
  const client = getRedis();
  if (client && redisReady) {
    try {
      await client.del(key);
    } catch (err) {
      // ignore
    }
  }
  memoryStore.delete(key);
}

module.exports = { cacheGet, cacheSet, cacheDel };
