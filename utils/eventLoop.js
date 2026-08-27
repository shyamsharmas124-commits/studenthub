/**
 * StudentHub - Node.js Event Loop.
 *
 * Demonstrates that synchronous JavaScript runs first, while asynchronous
 * callbacks are queued and resumed later. This is the same execution model
 * relied on by StudentHub's async database calls and scheduled jobs.
 */

function demonstrateEventLoop(log = console.log) {
  const events = [];

  events.push("sync-start");

  setTimeout(() => {
    events.push("timer-callback");
    log(events.join(" -> "));
  }, 0);

  Promise.resolve().then(() => {
    events.push("promise-microtask");
  });

  events.push("sync-end");

  // Immediately after this function, the synchronous order is:
  // sync-start -> sync-end
  return events;
}

module.exports = { demonstrateEventLoop };
