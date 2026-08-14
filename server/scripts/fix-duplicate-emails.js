// Run with: node scripts/fix-duplicate-emails.js
//
// Finds User documents that share the same email and renames all but one
// to a unique placeholder, so `prisma db push` can build the unique index
// on email. Nothing is deleted — duplicates are relabeled so you can
// manually review them and have the real owner set a proper email back
// via PATCH /api/user/email once they log in.
//
// Uses $runCommandRaw instead of the normal Prisma client. Some User docs
// have createdAt: null (same root cause as the old Course timestamp issue
// fix-data.js worked around) which trips Prisma's type validation before
// a findMany/update ever reaches Mongo. Raw commands talk to the driver
// directly and skip that validation entirely.
require("dotenv").config();
const prisma = require("../src/utils/prisma");

(async () => {
  try {
    const { cursor } = await prisma.$runCommandRaw({
      find: "User",
      projection: { _id: 1, email: 1, username: 1, createdAt: 1 },
    });

    const users = cursor.firstBatch;

    const byEmail = new Map();
    for (const user of users) {
      const key = typeof user.email === "string" ? user.email.trim().toLowerCase() : null;
      if (!key) continue;
      if (!byEmail.has(key)) byEmail.set(key, []);
      byEmail.get(key).push(user);
    }

    // Sort each group oldest-first. Docs with a missing/null createdAt are
    // treated as oldest (sorted first) rather than dropped, since we still
    // need to make a keep/rename decision for every account.
    const toTime = (u) => {
      const raw = u.createdAt && u.createdAt.$date ? u.createdAt.$date : u.createdAt;
      const t = raw ? new Date(raw).getTime() : NaN;
      return Number.isNaN(t) ? -Infinity : t;
    };

    const duplicateGroups = [...byEmail.values()]
      .filter((group) => group.length > 1)
      .map((group) => [...group].sort((a, b) => toTime(a) - toTime(b)));

    if (duplicateGroups.length === 0) {
      console.log("No duplicate emails found. Safe to run `prisma db push`.");
      return;
    }

    console.log(`Found ${duplicateGroups.length} email(s) with duplicates:\n`);

    for (const group of duplicateGroups) {
      const [keep, ...rest] = group;
      const keepTime = toTime(keep);
      console.log(`Email: ${keep.email}`);
      console.log(
        `  KEEPING  -> id=${keep._id.$oid} username=${keep.username} ` +
        `createdAt=${keepTime === -Infinity ? "MISSING" : new Date(keepTime).toISOString()}`
      );

      for (const dup of rest) {
        const placeholder = `${dup._id.$oid}+duplicate@needs-review.local`;

        await prisma.$runCommandRaw({
          update: "User",
          updates: [
            {
              q: { _id: dup._id },
              u: { $set: { email: placeholder } },
            },
          ],
        });

        const dupTime = toTime(dup);
        console.log(
          `  RENAMED  -> id=${dup._id.$oid} username=${dup.username} ` +
          `createdAt=${dupTime === -Infinity ? "MISSING" : new Date(dupTime).toISOString()} -> ${placeholder}`
        );
      }
      console.log("");
    }

    console.log(
      "Duplicates renamed to placeholder emails so the unique index can be created.\n" +
      "Some 'KEEPING' choices above may be based on a MISSING createdAt (treated\n" +
      "as oldest by default) — double check those in Prisma Studio before assuming\n" +
      "the right account was kept.\n\n" +
      "Ask the affected users to log in with their username and set a real email\n" +
      "via the Profile page (PATCH /api/user/email) — they'll need their current\n" +
      "password, which is unchanged."
    );
  } catch (err) {
    console.error("Fix failed:", err.message);
    console.error(err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
