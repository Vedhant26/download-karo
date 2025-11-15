const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const path = require("path");
const ytdlp = require("yt-dlp-exec");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

function bytesToSize(bytes) {
  if (!bytes) return "N/A";
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + " " + sizes[i];
}

/* -------------------- YOUTUBE (VIDEO) -------------------- */
app.post("/api/youtube", async (req, res) => {
  try {
    const { url } = req.body;
    const info = await ytdlp(url, {
      dumpSingleJson: true,
      noWarnings: true,
      skipDownload: true,
    });

    const title = info.title || "youtube_video";
    const thumbnail = info.thumbnail;
    const formats = (info.formats || []).filter(f => f.vcodec !== "none" && f.url);

    const qualities = formats.map(f => ({
      quality: f.format_note || `${f.height}p`,
      size: bytesToSize(f.filesize || f.filesize_approx),
      url: f.url,
    }));

    res.json({ title, thumbnail, qualities });
  } catch (err) {
    console.error("❌ YouTube Error:", err);
    res.status(500).json({ error: "Failed to fetch YouTube info" });
  }
});

/* -------------------- YOUTUBE MP3 AUDIO -------------------- */
app.post("/api/youtube/audio", async (req, res) => {
  const { url } = req.body;

  try {
    const info = await ytdlp(url, {
      dumpSingleJson: true,
      noWarnings: true,
      extractAudio: true,
      audioFormat: "mp3",
      skipDownload: true,
    });

    const audioUrl =
      info.url ||
      (info.requested_downloads && info.requested_downloads[0]?.url);

    if (!audioUrl) {
      return res.json({ error: "Unable to extract audio" });
    }

    res.json({
      title: info.title,
      thumbnail: info.thumbnail,
      url: audioUrl,
      format: "mp3",
    });

  } catch (err) {
    console.error("❌ MP3 ERROR:", err);
    res.json({ error: "Audio extraction failed" });
  }
});

/* -------------------- INSTAGRAM -------------------- */
app.post("/api/instagram", async (req, res) => {
  try {
    const { url } = req.body;
    const info = await ytdlp(url, {
      dumpSingleJson: true,
      noWarnings: true,
      skipDownload: true,
    });

    res.json({
      title: info.title,
      thumbnail: info.thumbnail,
      url: info.url,
    });

  } catch (err) {
    console.error("❌ Instagram Error:", err);
    res.status(500).json({ error: "Failed to fetch Instagram video" });
  }
});

/* -------------------- FACEBOOK -------------------- */
app.post("/api/facebook", async (req, res) => {
  try {
    const { url } = req.body;
    const info = await ytdlp(url, {
      dumpSingleJson: true,
      noWarnings: true,
      skipDownload: true,
    });

    res.json({
      title: info.title,
      thumbnail: info.thumbnail,
      url: info.url,
    });

  } catch (err) {
    console.error("❌ Facebook Error:", err);
    res.status(500).json({ error: "Failed to fetch Facebook video" });
  }
});

/* -------------------- PROXY STREAM -------------------- */
app.get("/api/proxy", async (req, res) => {
  try {
    const videoUrl = req.query.url;
    let title = req.query.title || "video";

    if (!videoUrl || !/^https?:/i.test(videoUrl)) {
      return res.status(400).send("Invalid video URL");
    }

    title = title.replace(/[^a-z0-9\-_ .]/gi, "_");
    const filename = `${title}.mp4`;

    const upstream = await fetch(videoUrl);

    if (!upstream.ok) {
      return res.status(502).send("Failed to fetch remote video");
    }

    res.setHeader("Content-Type", "video/mp4");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );

    upstream.body.pipe(res);

  } catch (err) {
    console.error("❌ Proxy Error:", err);
    res.status(500).send("Proxy failed");
  }
});

/* -------------------- FRONTEND -------------------- */
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

/* -------------------- START -------------------- */
app.listen(PORT, () =>
  console.log(`🚀 DOWNLOAD KARO backend running at http://localhost:${PORT}`)
);
