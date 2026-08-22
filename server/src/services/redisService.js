const { createClient } = require('redis');

let redisClient;
let isRedisConnected = false;

const initRedis = async () => {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  redisClient = createClient({ url: redisUrl });

  redisClient.on('error', (err) => {
    console.error('Redis Client Error', err);
    isRedisConnected = false;
  });

  redisClient.on('connect', () => {
    console.log('Redis Client Connected');
    isRedisConnected = true;
  });

  try {
    await redisClient.connect();
  } catch (err) {
    console.error('Failed to connect to Redis. Caching will be disabled.', err.message);
  }
};

const getCache = async (key) => {
  if (!isRedisConnected) return null;
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    return null;
  }
};

const setCache = async (key, value, expirationInSeconds = 3600) => {
  if (!isRedisConnected) return;
  try {
    await redisClient.setEx(key, expirationInSeconds, JSON.stringify(value));
  } catch (err) {
    console.error('Error setting cache:', err);
  }
};

module.exports = { initRedis, getCache, setCache };
