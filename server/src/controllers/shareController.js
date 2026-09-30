// Lightweight server-side rendering: the main app is a Vite/React SPA (client-
// side rendered), which is fine for logged-in users but means search engines
// and link-preview bots (Slack, Twitter, iMessage) see an empty <div id="root">
// when they hit a course URL directly. This route serves a small, real HTML
// document with the actual title/description/OG tags pre-rendered on the
// server for a single course — a standard "dynamic rendering" pattern that
// doesn't require converting the whole SPA to a framework like Next.js.
//
// It's mounted at GET /share/course/:id (see index.js), completely separate
// from /api/course/:id, so the existing React app and its view-counting
// logic are untouched.

const prisma = require("../utils/prisma");

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

exports.renderCoursePage = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await prisma.course.findUnique({
      where: { id },
      select: {
        title: true,
        description: true,
        category: true,
        difficulty: true,
        thumbnail: true,
        views: true,
        teacher: { select: { name: true } },
        reviews: { select: { rating: true } },
      },
    });

    if (!course) {
      return res.status(404).send("<h1>Course not found</h1>");
    }

    const avgRating = course.reviews.length
      ? (course.reviews.reduce((s, r) => s + r.rating, 0) / course.reviews.length).toFixed(1)
      : null;

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const spaUrl = `${clientUrl}/courses/${id}`;
    const title = escapeHtml(course.title);
    const description = escapeHtml(
      course.description || `Learn ${course.category} (${course.difficulty}) on StudentHub, taught by ${course.teacher?.name || "a StudentHub teacher"}.`
    );
    const image = course.thumbnail || `${clientUrl}/favicon.svg`;

    // Real, crawlable HTML — a bot never has to execute JS to read this.
    // Human visitors get redirected into the real SPA via meta-refresh.
    res.set("Content-Type", "text/html");
    res.send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title} · StudentHub</title>
  <meta name="description" content="${description}" />

  <meta property="og:type" content="website" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${escapeHtml(image)}" />
  <meta property="og:url" content="${spaUrl}" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${escapeHtml(image)}" />

  <meta http-equiv="refresh" content="0; url=${spaUrl}" />
</head>
<body>
  <h1>${title}</h1>
  <p>${description}</p>
  <p>Category: ${escapeHtml(course.category)} &middot; Difficulty: ${escapeHtml(course.difficulty)}</p>
  ${avgRating ? `<p>Rated ${avgRating} / 5 by students</p>` : ""}
  <p>Taught by ${escapeHtml(course.teacher?.name || "a StudentHub teacher")}</p>
  <p><a href="${spaUrl}">Continue to StudentHub &rarr;</a></p>
</body>
</html>`);
  } catch (err) {
    console.log("SHARE PAGE ERROR:", err);
    res.status(500).send("<h1>Something went wrong</h1>");
  }
};
