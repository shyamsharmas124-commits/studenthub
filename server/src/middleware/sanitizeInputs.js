// Guards against NoSQL injection: MongoDB queries built from raw user input can
// be hijacked with keys like `$gt`, `$ne`, `$where`, or dotted paths that reach
// into nested fields (e.g. { "password.$ne": null }). Prisma's typed query
// builder already blocks most of this because it never interpolates raw JSON
// into a filter — but this app also uses `$runCommandRaw`/`aggregateRaw` in a
// few places (see analyticsController, scripts/), so any body/query/params
// value is stripped of Mongo operator syntax before it reaches a controller.
//
// This only removes dangerous key *shapes* (`$foo`, `a.b`) — normal field
// values like emails, bios, or course titles are untouched, so existing
// request bodies keep working exactly as before.

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function sanitizeValue(value) {
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (isPlainObject(value)) {
    const clean = {};
    for (const [key, val] of Object.entries(value)) {
      if (key.startsWith("$") || key.includes(".")) {
        continue; // drop keys that look like Mongo operators or dotted paths
      }
      clean[key] = sanitizeValue(val);
    }
    return clean;
  }
  return value;
}

function sanitizeInputs(req, res, next) {
  if (req.body && isPlainObject(req.body)) req.body = sanitizeValue(req.body);
  if (req.query && isPlainObject(req.query)) req.query = sanitizeValue(req.query);
  if (req.params && isPlainObject(req.params)) req.params = sanitizeValue(req.params);
  next();
}

module.exports = sanitizeInputs;
