
    // ============================================================
    // CONFIGURAÇÃO RÁPIDA
    // Troque apenas o número abaixo pelo WhatsApp real da MS Split.
    // Formato: código do país + DDD + número, sem espaços ou símbolos.
    // Exemplo: 5551999999999
    // ============================================================
    const WHATSAPP = "5551996184755";
    const MESSAGE = "Olá! Gostaria de solicitar um orçamento para um serviço de ar-condicionado com a MS Split.";

    const whatsappUrl = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(MESSAGE)}`;
    document.getElementById("floatingWhatsApp").href = whatsappUrl;
    document.getElementById("ctaWhatsApp").href = whatsappUrl;

    document.getElementById("year").textContent = new Date().getFullYear();

    const header = document.getElementById("header");
    window.addEventListener("scroll", () => {
      header.classList.toggle("scrolled", window.scrollY > 20);
    });

    const menuBtn = document.getElementById("menuBtn");
    const nav = document.getElementById("nav");
    menuBtn.addEventListener("click", () => {
      nav.classList.toggle("mobile-open");
      menuBtn.textContent = nav.classList.contains("mobile-open") ? "✕" : "☰";
    });

    nav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        nav.classList.remove("mobile-open");
        menuBtn.textContent = "☰";
      });
    });

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, {threshold:.12});

    document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
 