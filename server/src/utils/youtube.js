function parseYouTubeUrl(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace("www.", "");

    if (!host.includes("youtube.com") && !host.includes("youtu.be")) {
      return { type: "external", videoId: null, playlistId: null };
    }

    const playlistId = parsed.searchParams.get("list");
    let videoId = parsed.searchParams.get("v");

    if (host.includes("youtu.be")) {
      videoId = parsed.pathname.slice(1);
    }

    if (playlistId) {
      return { type: "playlist", videoId, playlistId };
    }

    if (videoId) {
      return { type: "video", videoId, playlistId: null };
    }

    return { type: "external", videoId: null, playlistId: null };
  } catch {
    return { type: "external", videoId: null, playlistId: null };
  }
}

function buildVideoUrl(videoId, playlistId) {
  const params = new URLSearchParams({ v: videoId });
  if (playlistId) params.set("list", playlistId);
  return `https://www.youtube.com/watch?${params.toString()}`;
}

async function fetchYouTubeVideo(videoId) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey || !videoId) return null;

  const params = new URLSearchParams({
    part: "snippet",
    id: videoId,
    key: apiKey,
  });

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?${params}`
  );

  if (!response.ok) {
    console.log("YouTube video API error:", response.status);
    return null;
  }

  const data = await response.json();
  const item = data.items?.[0];
  if (!item) return null;

  return {
    order: 1,
    title: item.snippet.title,
    videoUrl: buildVideoUrl(videoId, null),
    duration: null,
  };
}

async function fetchYouTubePlaylist(playlistId) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return null;

  const lessons = [];
  let pageToken = "";

  do {
    const params = new URLSearchParams({
      part: "snippet",
      maxResults: "50",
      playlistId,
      key: apiKey,
    });
    if (pageToken) params.set("pageToken", pageToken);

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?${params}`
    );

    if (!response.ok) {
      const errText = await response.text();
      console.log("YouTube playlist API error:", response.status, errText.slice(0, 200));
      return lessons.length ? lessons : null;
    }

    const data = await response.json();

    data.items?.forEach((item, index) => {
      const videoId = item.snippet?.resourceId?.videoId;
      if (!videoId) return;

      lessons.push({
        order: lessons.length + 1,
        title: item.snippet.title,
        videoUrl: buildVideoUrl(videoId, playlistId),
        duration: item.snippet.description?.slice(0, 80) || null,
      });
    });

    pageToken = data.nextPageToken || "";
  } while (pageToken && lessons.length < 50);

  return lessons.length ? lessons : null;
}

module.exports = { parseYouTubeUrl, buildVideoUrl, fetchYouTubePlaylist, fetchYouTubeVideo };
