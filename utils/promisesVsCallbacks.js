/**
 * StudentHub - Promises vs Callbacks.
 *
 * StudentHub's controllers use async/await (Promise-based asynchronous code).
 * The callback version below is included to make the contrast explicit.
 */

function fetchWithCallback(getValue, callback) {
  try {
    getValue((error, value) => {
      if (error) return callback(error);
      callback(null, value);
    });
  } catch (error) {
    callback(error);
  }
}

function fetchWithPromise(getValue) {
  return new Promise((resolve, reject) => {
    getValue((error, value) => {
      if (error) return reject(error);
      resolve(value);
    });
  });
}

async function fetchWithAsyncAwait(getValue) {
  const value = await fetchWithPromise(getValue);
  return value;
}

// The Promise/async-await approach is the style used by StudentHub's
// controllers for Prisma and bcrypt operations.
module.exports = {
  fetchWithCallback,
  fetchWithPromise,
  fetchWithAsyncAwait,
};
