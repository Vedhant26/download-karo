document.addEventListener("DOMContentLoaded", () => {

  // ------------------ YOUTUBE ------------------
  const fetchBtn = document.getElementById("fetch-btn");
  const urlInput = document.getElementById("yt-url");
  const result = document.getElementById("result");
  const titleEl = document.getElementById("title");
  const thumb = document.getElementById("thumbnail");
  const qualitySelect = document.getElementById("quality");
  const trigger = document.getElementById("download-trigger");

  const audioResult = document.getElementById("audio-result");
  const audioTrigger = document.getElementById("audio-trigger");

  if (fetchBtn) {
    fetchBtn.onclick = async () => {
      const url = urlInput.value.trim();
      if (!url) return alert("Please enter a YouTube URL!");

      fetchBtn.textContent = "Fetching…";

      try {
        const res = await fetch("/api/youtube", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        // Show video info
        result.style.display = "block";
        thumb.src = data.thumbnail;
        titleEl.textContent = data.title;

        // Load video qualities
        qualitySelect.innerHTML = "";
        data.qualities.forEach(q => {
          const opt = document.createElement("option");
          opt.value = q.url;
          opt.text = `${q.quality} (${q.size})`;
          qualitySelect.appendChild(opt);
        });

        // VIDEO DOWNLOAD
        trigger.onclick = () => {
          const q = qualitySelect.value;
          window.location.href =
            `/api/proxy?url=${encodeURIComponent(q)}&title=${encodeURIComponent(data.title)}`;

          trigger.checked = true;
          setTimeout(() => trigger.checked = false, 4000);
        };

        // Load MP3 audio
        loadAudio(url);

      } catch (err) {
        alert("Failed to fetch YouTube info.");
      } finally {
        fetchBtn.textContent = "Fetch Info";
      }
    };
  }

  // ------------------ LOAD AUDIO MP3 ------------------
  async function loadAudio(videoUrl) {
    try {
      const res = await fetch("/api/youtube/audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: videoUrl })
      });

      const data = await res.json();
      if (data.error) return;

      audioResult.style.display = "block";

      audioTrigger.onclick = () => {
        window.location.href =
          `/api/proxy?url=${encodeURIComponent(data.url)}&title=${encodeURIComponent(data.title + "_audio")}`;

        audioTrigger.checked = true;
        setTimeout(() => audioTrigger.checked = false, 4000);
      };

    } catch (err) {
      console.error("Audio load failed:", err);
    }
  }

});
