# JavaScript Fundamentals — Applied in This Codebase

Quick reference tying event loop / hoisting / promises-vs-callbacks to real
code in this repo, for onboarding or interview prep.

## Promises vs. callbacks

Good news: this codebase already avoids callback-style async code entirely —
every controller uses `async`/`await` (e.g. `server/src/controllers/userController.js`,
`courseController.js`). That's the right call for readability and error
handling. Compare:

```js
// Callback style (NOT used here) — errors have to be checked manually at every step,
// and nesting grows with each dependent async call ("callback hell")
prisma.user.findUnique({ where: { id } }, (err, user) => {
  if (err) return res.status(500).json({ msg: err.message });
  bcrypt.compare(password, user.password, (err, valid) => {
    if (err) return res.status(500).json({ msg: err.message });
    // ...
  });
});
```

```js
// async/await (what this codebase actually does — see authControllers.js)
exports.login = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    const valid = await bcrypt.compare(password, user.password);
    // ...
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
```

`async`/`await` is syntax sugar over Promises — every `async function`
implicitly returns a Promise, and `await` pauses execution *within that
function* until the Promise settles, without blocking the whole Node process.

## The event loop

Node is single-threaded for your JS code, but I/O (database calls, file
reads, network requests) is handed off to the system and doesn't block that
thread. This is *why* `await prisma.user.findMany(...)` in
`courseController.js` doesn't freeze the server for other requests while
MongoDB responds — the event loop keeps processing other requests, and your
`async` function resumes once the DB call resolves.

Practical implication in this app: the scheduled jobs in
`server/src/jobs/scheduledJobs.js` (notification pruning, cache warm-up) run
on cron timers registered via `node-cron`, but their actual DB work is still
`async`/`await` under the hood — they queue onto the same event loop as
incoming HTTP requests rather than running on a separate thread, so they're
intentionally scheduled for low-traffic hours (`0 3 * * *` — 3 AM) to avoid
competing with real user requests for event-loop time.

## Hoisting

`var` and function declarations are hoisted to the top of their scope;
`let`/`const` are hoisted but stay in a "temporal dead zone" until their
declaration line executes. This codebase uses `const`/`let` exclusively
(check any controller) specifically to avoid hoisting surprises — e.g. this
would silently break in confusing ways with `var`:

```js
if (needsSanitizing) {
  var clean = sanitizeValue(input); // hoisted to function top, `clean` exists
} // but is `undefined` outside this block even though it "looks" scoped here
console.log(clean); // undefined, not a ReferenceError — easy to miss
```

With `const`/`let`, referencing `clean` outside the `if` block throws a clear
`ReferenceError` instead of silently returning `undefined` — see
`server/src/middleware/sanitizeInputs.js` for the actual (safe) version of
this pattern.
