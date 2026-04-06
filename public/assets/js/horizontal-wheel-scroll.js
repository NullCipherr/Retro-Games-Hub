(function () {
  function enableHorizontalWheel() {
    const scroller = document.scrollingElement || document.documentElement;

    window.addEventListener(
      'wheel',
      event => {
        const canScrollHorizontally = scroller.scrollWidth > window.innerWidth;
        if (!canScrollHorizontally) return;

        const dominantVertical = Math.abs(event.deltaY) > Math.abs(event.deltaX);
        if (!dominantVertical) return;

        event.preventDefault();
        scroller.scrollLeft += event.deltaY;
      },
      { passive: false }
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enableHorizontalWheel);
    return;
  }

  enableHorizontalWheel();
})();
