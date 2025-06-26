document.addEventListener("DOMContentLoaded", function () {
  // Countdown Timer Logic
  document.querySelectorAll('.countdown-timer .timer-display').forEach(displayElm => {
    const timer = displayElm.closest('.countdown-timer');
    const endDateStr = timer.getAttribute('data-end-date');
    if (!endDateStr) return;

    const endDate = new Date(endDateStr.includes(' ') ? endDateStr.replace(' ', 'T') : endDateStr);
    if (isNaN(endDate)) return;

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
  });

  // Carousel Logic
  function initCarousel(wrapper) {
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
  }

  const initAll = root => root.querySelectorAll('.carousel-wrapper').forEach(initCarousel);
  initAll(document);
  document.addEventListener('shopify:section:load', e => initAll(e.target));
});
