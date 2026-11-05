(() => {
  "use strict";

  const c = window.SANKI_CONFIG || {};
  const b = c.sankiBeats || {};
  const features = c.features || {};

  /* =========================================
     1. JOURNEY PAGE NAVIGATION
  ========================================= */

  const journeyEnabled = features.journey === true;

  document.querySelectorAll("header nav, nav[data-site-nav]").forEach(nav => {
    const existingLinks = nav.querySelectorAll(
      'a[href="journey.html"], a[href="/journey"]'
    );

    if (journeyEnabled) {
      if (!existingLinks.length) {
        const link = document.createElement("a");

        link.href = "journey.html";
        link.textContent = "Journey";

        const beatsLink = nav.querySelector(
          'a[href="beats.html"], a[href="/beats"]'
        );

        const referenceLink = beatsLink || nav.querySelector("a");

        if (referenceLink) {
          link.className = referenceLink.className;
        }

        if (beatsLink) {
          nav.insertBefore(link, beatsLink);
        } else {
          nav.appendChild(link);
        }
      }
    } else {
      existingLinks.forEach(link => link.remove());
    }
  });


  /* =========================================
     2. SANKI BEATS PAGE
  ========================================= */

  const beatsPage = document.querySelector("[data-beats-page]");

  if (beatsPage) {
    const beatsContent = document.querySelector("[data-beats-content]");
    const beatsOffline = document.querySelector("[data-beats-offline]");

    const isOnline = b.online !== false;

    if (beatsContent) {
      beatsContent.classList.toggle("hidden", !isOnline);
    }

    if (beatsOffline) {
      beatsOffline.classList.toggle("hidden", isOnline);
    }

    /* Official website links */
    document.querySelectorAll("[data-official-link]").forEach(link => {
      link.href = b.officialSiteUrl || "#";
    });

    /* AI Agent links */
    document.querySelectorAll("[data-agent-link]").forEach(link => {
      link.href = b.aiAgentUrl || b.officialSiteUrl || "#";
    });

    /* Sample Beats */
    const sampleGrid = document.querySelector("[data-sample-grid]");

    if (sampleGrid && isOnline) {
      const samples = Array.isArray(b.samples) ? b.samples : [];

      sampleGrid.innerHTML = samples.map((sample, index) => {
        const title = safe(sample.title || "Untitled Beat");
        const genre = safe(sample.genre || "Hip-Hop");
        const bpm = safe(sample.bpm || "N/A");
        const key = safe(sample.key || "N/A");
        const preview = encodeURIComponent(
          String(sample.preview || "")
        );

        return `
          <article class="card">
            <div class="cover">
              SANKI<br>
              BEATS
            </div>

            <div class="meta">
              SAMPLE ${String(index + 1).padStart(2, "0")} · ${genre}
            </div>

            <h3>${title}</h3>

            <p>${bpm} BPM / ${key}</p>

            <audio
              class="audio"
              controls
              preload="none"
              controlsList="nodownload"
              data-preview-player
            >
              <source
                src="assets/music/${preview}"
                type="audio/mpeg"
              >
              Your browser does not support audio playback.
            </audio>

            <p>30-second preview · No download</p>
          </article>
        `;
      }).join("");

      /* Limit each preview to 30 seconds */
      sampleGrid.querySelectorAll("[data-preview-player]").forEach(audio => {
        audio.addEventListener("timeupdate", () => {
          if (audio.currentTime >= 30) {
            audio.pause();
            audio.currentTime = 0;
          }
        });
      });
    }
  }


  /* =========================================
     3. MUSIC PAGE: UPCOMING + RELEASES
  ========================================= */

  const releaseGrid = document.querySelector("[data-release-grid]");
  const upcomingBox = document.querySelector("[data-upcoming]");

  if (releaseGrid || upcomingBox) {
    const list = Array.isArray(c.releases) ? c.releases : [];
    const upcoming = list.filter(r => r.status === "upcoming");
    const released = list.filter(r => r.status !== "upcoming");

    const okUrl = u => /^https?:\/\//.test(u || "") ? u : "";
    const slug = s => String(s || "").toLowerCase().trim()
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const posterBase = r => "assets/images/music/" + slug(r.poster || r.title);

    const linkButtons = r => [
      okUrl(r.youtube)
        ? `<a class="btn primary" href="${safe(okUrl(r.youtube))}" target="_blank" rel="noopener">▶ YouTube</a>` : "",
      okUrl(r.spotify)
        ? `<a class="btn" href="${safe(okUrl(r.spotify))}" target="_blank" rel="noopener">Spotify ↗</a>` : ""
    ].join("");

    const posterImg = r => `<img class="poster" alt="${safe(r.title)} poster"
        data-poster="${safe(posterBase(r))}" data-title="${safe(r.title)}">`;

    if (upcomingBox) {
      upcomingBox.innerHTML = upcoming.map(r => `
        <div class="upcoming">
          ${posterImg(r)}
          <div class="upcoming-info">
            <div class="eyebrow">Upcoming · Coming Soon</div>
            <h2>${safe(r.title)}</h2>
            <p class="sub">${safe(r.desc)}</p>
            <div class="links">${linkButtons(r)}</div>
          </div>
        </div>`).join("");
    }

    if (releaseGrid) {
      releaseGrid.innerHTML = released.length
        ? released.map(r => `
          <article class="card">
            ${posterImg(r)}
            <div class="meta">TERA SANKI · OUT NOW</div>
            <h3>${safe(r.title)}</h3>
            <p>${safe(r.desc)}</p>
            <div class="links">${linkButtons(r)}</div>
          </article>`).join("")
        : `<p class="sub">New music coming soon.</p>`;
    }

    /* Poster loader: .jpg -> .png -> text cover */
    document.querySelectorAll("img[data-poster]").forEach(img => {
      img.addEventListener("error", () => {
        if (!img.dataset.tried) {
          img.dataset.tried = "1";
          img.src = img.dataset.poster + ".png";
        } else {
          const cover = document.createElement("div");
          cover.className = "cover";
          cover.textContent = img.dataset.title;
          img.replaceWith(cover);
        }
      });
      img.src = img.dataset.poster + ".jpg";
    });
  }


  /* =========================================
     4. BASIC CONTENT PROTECTION
  ========================================= */

  const protectionEnabled =
    document.body?.dataset.deterInspect === "true";

  if (protectionEnabled) {

    /* Disable right-click */
    document.addEventListener("contextmenu", event => {
      event.preventDefault();
    });

    /* Disable common developer-tools shortcuts */
    document.addEventListener("keydown", event => {
      const key = event.key.toUpperCase();

      if (
        key === "F12" ||
        (event.ctrlKey && event.shiftKey &&
          ["I", "J", "C"].includes(key))
      ) {
        event.preventDefault();
      }
    });
  }


  /* =========================================
     5. SAFE TEXT OUTPUT
  ========================================= */

  function safe(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }

})();
