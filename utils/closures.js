/**
 * StudentHub - JavaScript Closures.
 *
 * Based on the real cache module pattern used by server/src/utils/cache.js.
 * The module-scoped state is private to these functions through closure.
 */

function createCache(ttlMs = 300000) {
  const memoryStore = new Map();

  function set(key, value) {
    memoryStore.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  function get(key) {
    const entry = memoryStore.get(key);
    if (!entry) return null;

    if (entry.expiresAt < Date.now()) {
      memoryStore.delete(key);
      return null;
    }

    return entry.value;
  }

  function del(key) {
    memoryStore.delete(key);
  }

  // These functions close over memoryStore, keeping cache state private.
  return { get, set, del };
}

module.exports = { createCache };
