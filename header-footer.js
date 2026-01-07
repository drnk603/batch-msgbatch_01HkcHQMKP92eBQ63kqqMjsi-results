(function () {
  var header = document.querySelector('.hf-header');
  var toggle = document.querySelector('.hf-nav-toggle');
  var nav = document.querySelector('#hf-main-nav');
  if (!header || !toggle || !nav) {
    return;
  }
  var lastScrollY = window.pageYOffset || 0;
  function setNavState(open) {
    var state = open ? 'true' : 'false';
    toggle.setAttribute('aria-expanded', state);
    toggle.setAttribute('data-open', state === 'true' ? 'true' : 'false');
    nav.setAttribute('data-open', state === 'true' ? 'true' : 'false');
  }
  toggle.addEventListener('click', function () {
    var isOpen = nav.getAttribute('data-open') === 'true';
    setNavState(!isOpen);
  });
  document.addEventListener('click', function (event) {
    var isOpen = nav.getAttribute('data-open') === 'true';
    if (!isOpen) {
      return;
    }
    if (!header.contains(event.target)) {
      setNavState(false);
    }
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 768) {
      setNavState(false);
    }
  });
  window.addEventListener('scroll', function () {
    var currentY = window.pageYOffset || 0;
    var isScrollingDown = currentY > lastScrollY;
    var threshold = 32;
    if (currentY > threshold && isScrollingDown) {
      header.style.transform = 'translateY(-100%)';
      header.style.transition = 'transform 200ms ease-out';
    } else {
      header.style.transform = 'translateY(0)';
      header.style.transition = 'transform 200ms ease-out';
    }
    lastScrollY = currentY;
  });
})();
