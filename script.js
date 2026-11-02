// Auto-update copyright year
document.getElementById('year').textContent = new Date().getFullYear();

// Close mobile nav when a link is clicked
const navLinks = document.getElementById('navLinks');
const navCollapse = bootstrap.Collapse.getOrCreateInstance(navLinks, { toggle: false });

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navCollapse.hide();
  });
});

// Highlight active nav link on scroll
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.navbar-nav a');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navItems.forEach(a => a.classList.remove('active'));
      const active = document.querySelector(`.navbar-nav a[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => observer.observe(s));

// Travel gallery: tap-to-reveal caption on touch devices (hover handles desktop)
const isTouch = window.matchMedia('(hover: none)').matches;
if (isTouch) {
  document.querySelectorAll('.travel-tile').forEach(tile => {
    tile.addEventListener('click', () => {
      const wasActive = tile.classList.contains('active');
      document.querySelectorAll('.travel-tile.active').forEach(t => t.classList.remove('active'));
      if (!wasActive) tile.classList.add('active');
    });
  });
}
