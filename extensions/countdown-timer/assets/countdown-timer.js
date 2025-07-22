document.addEventListener("DOMContentLoaded", () => initAll(document));
document.addEventListener("shopify:section:load", (e) => initAll(e.target));

function initAll(root) {
  root.querySelectorAll(".countdown-timer").forEach(initTimer);
  root.querySelectorAll(".carousel-wrapper").forEach(initCarousel);
}

async function initTimer(timer) {
  if (timer.__int) clearInterval(timer.__int);

  const blockId = timer.closest('[id^="shopify-section"]')?.id || "global";
  const bannerId = timer.dataset.bannerId || blockId;
  const sessionKey = `banner_viewed_${bannerId}_this_session`;
  const inEditor = window.Shopify && Shopify.designMode;
  const enableLimit = timer.dataset.enableViewLimit === "true";

  if (!inEditor && localStorage.getItem(sessionKey)) {
    console.log(`[${bannerId}] Skipping — already viewed this session`);
    return;
  }

  if (!inEditor) {
    localStorage.setItem(sessionKey, "1");
    console.log(`[${bannerId}] Marked as viewed this session`);
  }

  // 📡 Call API to track views
  if (!inEditor && enableLimit) {
    const hidden = await trackViewWithAPI(bannerId);
    if (hidden) {
      timer.classList.add("hide-banner-content");
      console.warn(`[${bannerId}] Max views reached. Banner hidden.`);
      return;
    }
  }

  const out = timer.querySelector(".timer-display");
  const endStr = timer.dataset.endDate || timer.getAttribute("data-end-date");
  if (!out || !endStr) return;

  const end = new Date(endStr.replace(" ", "T"));
  if (isNaN(end)) {
    console.warn(`[${bannerId}] Invalid date format: "${endStr}"`);
    return;
  }

  function tick() {
    const diff = end - Date.now();
    if (diff <= 0) {
      out.style.display = "none";
      timer.querySelector(".timer-expired-message")?.style.setProperty("display", "block");
      clearInterval(timer.__int);
      console.log(`[${bannerId}] Countdown expired.`);
      return;
    }
    const d = Math.floor(diff / 864e5);
    const h = Math.floor(diff / 36e5) % 24;
    const m = Math.floor(diff / 6e4) % 60;
    const s = Math.floor(diff / 1e3) % 60;
    timer.querySelector(".js-timer-days").textContent = d.toString().padStart(2, "0");
    timer.querySelector(".js-timer-hours").textContent = h.toString().padStart(2, "0");
    timer.querySelector(".js-timer-minutes").textContent = m.toString().padStart(2, "0");
    timer.querySelector(".js-timer-seconds").textContent = s.toString().padStart(2, "0");
  }

  tick();
  timer.__int = setInterval(tick, 1000);
  console.log(`[${bannerId}] Countdown started. Ends at ${end.toISOString()}`);
}

function initCarousel(wrapper) {
  if (wrapper.__int) clearInterval(wrapper.__int);
  const track = wrapper.querySelector(".carousel-track");
  if (!track || track.children.length <= 1) return;

  let i = 0;
  const total = track.children.length;
  const go = (n) => (track.style.transform = `translateX(-${n * 100}%)`);
  const next = () => { i = (i + 1) % total; go(i); };
  const start = () => { wrapper.__int = setInterval(next, 3000); };
  const stop  = () => { clearInterval(wrapper.__int); };

  wrapper.addEventListener("mouseenter", stop);
  wrapper.addEventListener("mouseleave", () => { stop(); start(); });

  go(0);
  start();
}

// 🔁 Clear session keys on page unload
window.addEventListener("beforeunload", () =>
  Object.keys(localStorage)
    .filter((k) => k.includes("_this_session"))
    .forEach((k) => {
      localStorage.removeItem(k);
      console.log(`Cleared session key: ${k}`);
    })
);

// 🌐 API Call to Track Views
async function trackViewWithAPI(bannerId) {
  try {
    const res = await fetch("/api/banner-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bannerId }),
    });
    const data = await res.json();
    return data?.hideBanner;
  } catch (err) {
    console.error("Failed to track banner view:", err);
    return false;
  }
}
