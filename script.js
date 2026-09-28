const header = document.getElementById("siteHeader");
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
const scrollProgress = document.getElementById("scrollProgress");
const backTop = document.getElementById("backTop");

function updateScrollUI() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

  scrollProgress.style.width = `${progress}%`;
  header.classList.toggle("scrolled", scrollTop > 30);
  backTop.classList.toggle("show", scrollTop > 550);
}

window.addEventListener("scroll", updateScrollUI, { passive: true });
updateScrollUI();

menuToggle.addEventListener("click", () => {
  const open = mainNav.classList.toggle("open");
  menuToggle.classList.toggle("active", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("menu-open", open);
});

document.querySelectorAll(".main-nav a").forEach(link => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    menuToggle.classList.remove("active");
    menuToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  });
});

backTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

const revealElements = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12,
  rootMargin: "0px 0px -35px 0px"
});

revealElements.forEach(element => revealObserver.observe(element));

/* Movimento muito sutil do visual principal conforme o mouse.
   Desativado em telas touch para preservar desempenho. */
const heroVisual = document.querySelector(".hero-visual");

if (heroVisual && window.matchMedia("(pointer: fine)").matches) {
  heroVisual.addEventListener("mousemove", (event) => {
    const rect = heroVisual.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    heroVisual.style.transform = `translate(${x * 7}px, ${y * 7}px)`;
  });

  heroVisual.addEventListener("mouseleave", () => {
    heroVisual.style.transform = "translate(0, 0)";
  });
}

/* Links internos com deslocamento suave, respeitando o cabeçalho fixo. */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", event => {
    const targetId = link.getAttribute("href");
    if (!targetId || targetId === "#") return;

    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();

    const headerHeight = header.offsetHeight;
    const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight + 1;

    window.scrollTo({
      top: targetPosition,
      behavior: "smooth"
    });
  });
});

/* Pequena animação numérica no rodapé/elementos futuros.
   Mantida como função reutilizável para próximas versões. */
function animateNumber(element, target, duration = 1000) {
  const start = performance.now();

  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.round(target * eased).toLocaleString("pt-BR");

    if (progress < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

window.addEventListener("resize", () => {
  if (window.innerWidth > 820) {
    mainNav.classList.remove("open");
    menuToggle.classList.remove("active");
    menuToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  }
});
