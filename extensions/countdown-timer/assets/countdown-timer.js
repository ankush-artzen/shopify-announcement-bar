
document.addEventListener("DOMContentLoaded", () => initAll(document));
document.addEventListener("shopify:section:load", (e) => initAll(e.target));

function initAll(root) {
  root.querySelectorAll(".countdown-timer").forEach(initTimer);
  root.querySelectorAll(".carousel-wrapper").forEach(initCarousel);
}

function initTimer(timer) {
  if (timer.__int) clearInterval(timer.__int);

  const blockId = timer.closest('[id^="shopify-section"]')?.id || "global";
  const viewKey = `banner_view_count_${blockId}`;
  const versionKey = `${viewKey}_version`;
  const sessionKey = `${viewKey}_viewed_this_load`;
  const inEditor = window.Shopify && Shopify.designMode;
  const enableLimit = timer.dataset.enableViewLimit === "true";

  if (!inEditor && localStorage.getItem(sessionKey)) {
    console.log(`[${blockId}] Skipping — already viewed this session`);
    return;
  }
  if (!inEditor) {
    localStorage.setItem(sessionKey, "1");
    console.log(`[${blockId}] Marked as viewed for this session`);
  }

  const bannerConfig = JSON.stringify({
    name: timer.querySelector("h3")?.textContent || "",
    endDate: timer.dataset.endDate || "",
    maxViews: timer.dataset.maxViews || "",
    enableViewLimit: enableLimit,
  });

  const currentVersion = btoa(unescape(encodeURIComponent(bannerConfig)));
  const storedVersion = localStorage.getItem(versionKey);

  if (!inEditor && storedVersion !== currentVersion) {
    console.log(`[${blockId}] Config changed — resetting view count`);
    localStorage.setItem(viewKey, "0");
    localStorage.setItem(versionKey, currentVersion);
  }

  const maxViews = parseInt(timer.dataset.maxViews || "100", 10);
  let views = parseInt(localStorage.getItem(viewKey) || "0", 10);

  if (!inEditor && enableLimit) {
    if (views >= maxViews) {
      console.warn(`[${blockId}] Max views (${maxViews}) reached. Banner hidden.`);
      timer.remove();
      return;
    }
    views++;
    localStorage.setItem(viewKey, views);
    console.log(`[${blockId}] View counted: ${views}/${maxViews}`);
  } else {
    console.log(`[${blockId}] View limit not enabled — skipping max view logic`);
  }

  const out = timer.querySelector(".timer-display");
  const endStr = timer.dataset.endDate || timer.getAttribute("data-end-date");
  if (!out || !endStr) return;

  const end = new Date(endStr.replace(" ", "T"));
  if (isNaN(end)) {
    console.warn(`[${blockId}] Invalid date format: "${endStr}"`);
    return;
  }

  function tick() {
    const diff = end - Date.now();
    if (diff <= 0) {
      out.style.display = "none";
      timer.querySelector(".timer-expired-message")?.style.setProperty("display", "block");
      clearInterval(timer.__int);
      console.log(`[${blockId}] Countdown expired.`);
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
  console.log(`[${blockId}] Countdown started. End time: ${end.toISOString()}`);
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

window.addEventListener("beforeunload", () =>
  Object.keys(localStorage)
    .filter((k) => k.endsWith("_viewed_this_load"))
    .forEach((k) => {
      localStorage.removeItem(k);
      console.log(`Cleared session view key: ${k}`);
    })
);

