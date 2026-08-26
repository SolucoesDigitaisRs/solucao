 /* ==========================================================================
   1. CONFIGURAÇÕES GERAIS E WHATSAPP
   ========================================================================== */
 // Número do WhatsApp da MS Split (Código do país + DDD + Número)
 const WHATSAPP_NUMBER = "5551996184755";
 const DEFAULT_MESSAGE = "Olá! Gostaria de solicitar um orçamento com a MS Split. ❄️";

 // Monta a URL padrão de contato
 const whatsappDefaultUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

 // Aplica a URL aos botões estáticos do WhatsApp
 const floatingBtn = document.getElementById("floatingWhatsApp");
 const ctaBtn = document.getElementById("ctaWhatsApp");

 if (floatingBtn) floatingBtn.href = whatsappDefaultUrl;
 if (ctaBtn) ctaBtn.href = whatsappDefaultUrl;

 // Atualiza o ano do copyright no rodapé automaticamente
 const yearEl = document.getElementById("year");
 if (yearEl) yearEl.textContent = new Date().getFullYear();


 /* ==========================================================================
   2. NAVEGAÇÃO E CABEÇALHO
   ========================================================================== */
const header = document.getElementById("header");
if (header) {
  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 20);
  });
}

const menuBtn = document.getElementById("menuBtn");
const nav = document.getElementById("nav");

if (menuBtn && nav) {
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
}


 /* ==========================================================================
   3. ANIMAÇÃO SCROLL REVEAL
   ========================================================================== */
 const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
 }, { threshold: 0.12 });

 document.querySelectorAll(".reveal").forEach(el => observer.observe(el));


 /* ==========================================================================
   4. INICIALIZAÇÃO AO CARREGAR O DOM (MODAL E SCHEMA.ORG)
   ========================================================================== */
 document.addEventListener("DOMContentLoaded", () => {
  
  // --- A. Galeria e Modal de Imagem ---
  const modal = document.getElementById("image-modal");
  const modalImg = document.getElementById("modal-img");
  const closeModalBtn = document.getElementById("close-modal");
  const galleryImages = document.querySelectorAll(".gallery-img");

  if (modal && modalImg) {
    galleryImages.forEach(img => {
      img.addEventListener("click", () => {
        modalImg.src = img.src;
        modalImg.alt = img.alt;
        modal.showModal();
      });
    });

    closeModalBtn?.addEventListener("click", () => modal.close());

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.close();
      }
    });
  }

  // --- B. Injeção do Schema.org para SEO Local ---
  /*const schemaData = {
  "@context": "https://schema.org",
  "@type": "HVACBusiness",
  "name": "MS Split",
  "url": "https://www.mssplit.com.br/",
  "image": "https://www.mssplit.com.br/img/logo.jpeg",
  "logo": "https://www.mssplit.com.br/img/logo.jpeg",
  "description": "Empresa especializada em instalação, manutenção preventiva, conserto e higienização de ar-condicionado Split, Multi-Split e Inverter. Atendimento residencial e comercial em Viamão, Porto Alegre e Região Metropolitana.",
  "telephone": "+5551996184755",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Av. Osvaldo Godoy Gomes, 190 - Vila Augusta",
    "addressLocality": "Viamão",
    "addressRegion": "RS",
    "postalCode": "94510-020",
    "addressCountry": "BR"
   },
   "areaServed": [
    { "@type": "City", "name": "Viamão" },
    { "@type": "City", "name": "Porto Alegre" },
    { "@type": "AdministrativeArea", "name": "Região Metropolitana de Porto Alegre" }
   ],
   "priceRange": "$$"
 };

  const scriptElement = document.createElement("script");
  scriptElement.type = "application/ld+json";
  scriptElement.text = JSON.stringify(schemaData);
  document.head.appendChild(scriptElement); */

 }
 );


 /* ==========================================================================
   5. FORMULÁRIO DE ORÇAMENTO → WHATSAPP
   ========================================================================== */
  const budgetForm = document.getElementById("budgetForm");

  if (budgetForm) {
  budgetForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const service = document.getElementById("service")?.value || "Não informado";
    const location = document.getElementById("location")?.value || "Não informado";
    const model = document.getElementById("model")?.value || "Não informado";
    const quantity = document.getElementById("quantity")?.value || "1";
    const details = document.getElementById("details")?.value || "Nenhuma informação adicional.";

    const installationChecked = document.querySelector('input[name="installation"]:checked');
    const installation = installationChecked ? installationChecked.value : "Não informado";

    const formattedMessage = 
 `Olá! Gostaria de solicitar um orçamento com a MS Split. ❄️

 *Serviço:* ${service}
 *Cidade/Bairro:* ${location}
 *Modelo/BTUs:* ${model}
 *Quantidade:* ${quantity}
 *Já existe instalação no local?:* ${installation}

 *Informações adicionais:*
 ${details}

 📸 Vou enviar fotos do local pelo WhatsApp para facilitar a avaliação.`;

    const formWhatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(formattedMessage)}`;
    window.open(formWhatsappUrl, "_blank");
  });
}