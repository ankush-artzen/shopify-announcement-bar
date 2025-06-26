document.addEventListener("DOMContentLoaded", function () {
  const timers = document.querySelectorAll('.countdown-timer');

  timers.forEach(timer => {
    const blockId = timer.closest('[id^="shopify-section"]')?.id || "global";

    const bannerConfig = JSON.stringify({
      name: timer.querySelector("h3")?.textContent || '',
      endDate: timer.getAttribute('data-end-date') || '',
      maxViews: timer.dataset.maxViews || ''
    });

    const viewKey = `banner_view_count_${blockId}`;
    const versionKey = `${viewKey}_version`;
    const currentVersion = btoa(unescape(encodeURIComponent(bannerConfig)));
    const storedVersion = localStorage.getItem(versionKey);

    if (storedVersion !== currentVersion) {
      localStorage.setItem(viewKey, "0");
      localStorage.setItem(versionKey, currentVersion);
    }

    const maxViews = parseInt(timer.dataset.maxViews || "100", 10);
    let viewCount = parseInt(localStorage.getItem(viewKey) || "0", 10);

    if (viewCount >= maxViews) {
      timer.style.display = 'none';
      return;
    }

    localStorage.setItem(viewKey, viewCount + 1);

    const displayElm = timer.querySelector('.timer-display');
    const endDateStr = timer.getAttribute('data-end-date');

    if (displayElm && endDateStr) {
      const endDate = new Date(endDateStr.includes(' ') ? endDateStr.replace(' ', 'T') : endDateStr);
      if (!isNaN(endDate)) {
        function update() {
          const diff = endDate - Date.now();
          if (diff <= 0) {
            displayElm.style.display = 'none';
            timer.querySelector('.timer-expired-message')?.style.setProperty('display', 'block');
            return;
          }
          const days = Math.floor(diff / 864e5);
          const hours = Math.floor(diff / 36e5) % 24;
          const minutes = Math.floor(diff / 6e4) % 60;
          const seconds = Math.floor(diff / 1e3) % 60;
          timer.querySelector('.js-timer-days').textContent = String(days).padStart(2, '0');
          timer.querySelector('.js-timer-hours').textContent = String(hours).padStart(2, '0');
          timer.querySelector('.js-timer-minutes').textContent = String(minutes).padStart(2, '0');
          timer.querySelector('.js-timer-seconds').textContent = String(seconds).padStart(2, '0');
        }
        update();
        setInterval(update, 1000);
      }
    }

    const initCarousel = wrapper => {
      const track = wrapper.querySelector('.carousel-track');
      if (!track || track.children.length <= 1) return;
      let idx = 0, timer;
      const total = track.children.length;
      const goTo = i => track.style.transform = `translateX(-${i * 100}%)`;
      const next = () => { idx = (idx + 1) % total; goTo(idx); };
      const start = () => timer = setInterval(next, 3000);
      const stop = () => clearInterval(timer);
      wrapper.addEventListener('mouseenter', stop);
      wrapper.addEventListener('mouseleave', () => { stop(); start(); });
      goTo(0); start();
    };

    timer.querySelectorAll('.carousel-wrapper').forEach(initCarousel);
  });

  document.addEventListener('shopify:section:load', e => {
    e.target.querySelectorAll('.carousel-wrapper').forEach(wrapper => {
      const initCarousel = wrapper => {
        const track = wrapper.querySelector('.carousel-track');
        if (!track || track.children.length <= 1) return;
        let idx = 0, timer;
        const total = track.children.length;
        const goTo = i => track.style.transform = `translateX(-${i * 100}%)`;
        const next = () => { idx = (idx + 1) % total; goTo(idx); };
        const start = () => timer = setInterval(next, 3000);
        const stop = () => clearInterval(timer);
        wrapper.addEventListener('mouseenter', stop);
        wrapper.addEventListener('mouseleave', () => { stop(); start(); });
        goTo(0); start();
      };
      initCarousel(wrapper);
    });
  });
});
