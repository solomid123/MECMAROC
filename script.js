const pages = [
  { href: "index.html", label: "Accueil" },
  { href: "about.html", label: "À propos" },
  { 
    href: "services.html", 
    label: "Services",
    dropdown: [
      { href: "service-conception.html", label: "Conception mécanique" },
      { href: "service-calcul.html", label: "Calcul et validation" },
      { href: "service-fiabilisation.html", label: "Indus. et fiabilisation" },
      { href: "service-preventive.html", label: "Maintenance préventive" },
      { href: "service-predictive.html", label: "Maintenance prédictive" },
      { href: "service-corrective.html", label: "Maintenance corrective" }
    ]
  },
  { 
    href: "industries.html", 
    label: "Secteurs",
    dropdown: [
      { href: "secteur-lignes.html", label: "Lignes de production" },
      { href: "secteur-equipements.html", label: "Équipements industriels" },
      { href: "secteur-machines.html", label: "Machines spéciales" },
      { href: "secteur-infrastructures.html", label: "Ateliers et infrastructures" }
    ]
  },
  { href: "projects.html", label: "Projets" },
  { href: "blog.html", label: "Blog" },
  { href: "presse.html", label: "Presse" },
  { href: "contact.html", label: "Contact" },
];

const currentPage = window.location.pathname.split("/").pop() || "index.html";

function navMarkup(isFooter = false) {
  return pages
    .map((page) => {
      const isCurrent = page.href === currentPage || (page.dropdown && page.dropdown.some(sub => sub.href === currentPage));
      
      let linkHtml = `<a href="${page.href}" class="${isCurrent ? "is-current" : ""}" ${isCurrent ? 'aria-current="page"' : ""}>${page.label}</a>`;
      
      if (!isFooter && page.dropdown) {
        let dropdownHtml = `<div class="nav-dropdown">`;
        dropdownHtml += page.dropdown.map(sub => `<a href="${sub.href}" class="${sub.href === currentPage ? "is-current" : ""}">${sub.label}</a>`).join('');
        dropdownHtml += `</div>`;
        return `<div class="nav-item has-dropdown">${linkHtml}${dropdownHtml}</div>`;
      }
      
      return linkHtml;
    })
    .join("");
}

function buildHeader() {
  const mount = document.querySelector("[data-site-header]");

  if (!mount) {
    return;
  }

  mount.innerHTML = `
    <header class="site-header">
      <div class="shell header-inner">
        <a href="index.html" class="brand" aria-label="ExoMaintenance">
          <img
            src="assets/exomaintenance-mark.png"
            alt="Monogramme ExoMaintenance"
            class="brand-logo"
          />
          <span class="brand-copy">
            <strong><span style="color: red;">Exo</span>Maintenance</strong>
            <small>Bureau d'étude mécanique</small>
          </span>
        </a>

        <button class="nav-toggle" type="button" aria-expanded="false" aria-label="Ouvrir le menu">
          <span></span>
          <span></span>
        </button>

        <nav class="site-nav" aria-label="Navigation principale">
          ${navMarkup()}
        </nav>

        <div class="header-actions">
          <a class="btn btn-primary" href="contact.html">Demander un devis</a>
        </div>
      </div>
    </header>
  `;

  const header = mount.querySelector(".site-header");
  const toggle = mount.querySelector(".nav-toggle");
  const links = mount.querySelectorAll(".site-nav a");

  toggle?.addEventListener("click", () => {
    const isOpen = header.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  links.forEach((link) => {
    link.addEventListener("click", () => {
      header.classList.remove("is-open");
      toggle?.setAttribute("aria-expanded", "false");
    });
  });
}

function buildFooter() {
  const mount = document.querySelector("[data-site-footer]");

  if (!mount) {
    return;
  }

  mount.innerHTML = `
    <footer class="site-footer">
      <div class="shell footer-grid">
        <div class="footer-block">
          <a href="index.html" class="brand brand-footer" aria-label="ExoMaintenance">
            <img
              src="assets/exomaintenance-mark.png"
              alt="Monogramme ExoMaintenance"
              class="brand-logo"
            />
            <span class="brand-copy">
              <strong><span style="color: red;">Exo</span>Maintenance</strong>
              <small>Études mécaniques et maintenance industrielle</small>
            </span>
          </a>
          <p>
            Bureau d'étude mécanique et maintenance industrielle :
            conception, fiabilisation, maintenance préventive, prédictive
            et corrective.
          </p>
        </div>

        <div class="footer-block">
          <h2>Navigation</h2>
          <div class="footer-links">${navMarkup(true)}</div>
        </div>

        <div class="footer-block">
          <h2>Contact</h2>
          <div class="footer-contact">
            <a href="mailto:contact@exomaintenance.fr">contact@exomaintenance.fr</a>
            <a href="mailto:projets@exomaintenance.fr">projets@exomaintenance.fr</a>
            <a href="tel:+33758551524">+33 7 58 55 15 24</a>
          </div>
          <form class="newsletter-form" data-newsletter-form>
            <label class="sr-only" for="newsletter-email">Email</label>
            <input id="newsletter-email" type="email" name="email" placeholder="Votre email" required />
            <button class="btn btn-secondary" type="submit">Newsletter</button>
          </form>
          <p class="form-status" data-newsletter-status></p>
        </div>
      </div>

      <div class="shell footer-bottom">
        <span>&copy; <span data-current-year></span> ExoMaintenance. Tous droits réservés.</span>
        <span>Bureau d'étude mécanique et maintenance industrielle</span>
      </div>
    </footer>
  `;

  const year = mount.querySelector("[data-current-year]");
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }
}

function mailtoUrl(subject, body, to) {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function wireContactForm() {
  const form = document.querySelector("[data-mail-form]");
  const status = document.querySelector("[data-form-status]");
  const submitBtn = form ? form.querySelector('button[type="submit"]') : null;

  if (!form) {
    return;
  }

  const EDGE_URL = "https://koowuhkrnqbtpnkqkbpw.supabase.co/functions/v1/send-contact";

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const payload = {
      name: (data.get("name") || "").toString().trim(),
      email: (data.get("email") || "").toString().trim(),
      company: (data.get("company") || "").toString().trim(),
      phone: (data.get("phone") || "").toString().trim(),
      industry: (data.get("industry") || "").toString().trim(),
      project: (data.get("project") || "").toString().trim(),
      message: (data.get("message") || "").toString().trim(),
    };

    // Disable button and show loading
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Envoi en cours…";
    }
    if (status) {
      status.textContent = "";
      status.style.color = "";
    }

    try {
      const res = await fetch(EDGE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        if (status) {
          status.textContent = "✓ Message envoyé avec succès ! Nous vous répondrons rapidement.";
          status.style.color = "#0f766e";
        }
        form.reset();
      } else {
        throw new Error(result.error || "Erreur inconnue");
      }
    } catch (err) {
      if (status) {
        status.textContent = "✗ " + (err.message || "Échec de l'envoi. Veuillez réessayer.");
        status.style.color = "#dc2626";
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Envoyer le message";
      }
    }
  });
}

function wireNewsletterForm() {
  const form = document.querySelector("[data-newsletter-form]");
  const status = document.querySelector("[data-newsletter-status]");

  if (!form) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const email = (data.get("email") || "").toString().trim();

    if (status) {
      status.textContent = "Votre client mail s'ouvre pour confirmer l'inscription.";
    }

    window.location.href = mailtoUrl(
      "Inscription newsletter ExoMaintenance",
      `Bonjour,\n\nMerci d'ajouter cet email à la newsletter ExoMaintenance : ${email}`,
      "contact@exomaintenance.fr"
    );
  });
}

function revealOnScroll() {
  const items = document.querySelectorAll("[data-reveal]");

  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.01, rootMargin: "0px 0px 60px 0px" }
  );

  items.forEach((item) => observer.observe(item));
}

document.addEventListener("DOMContentLoaded", () => {
  const favicon = document.createElement("link");
  favicon.rel = "icon";
  favicon.type = "image/png";
  favicon.href = "assets/exomaintenance-mark.png";
  document.head.appendChild(favicon);

  buildHeader();
  buildFooter();
  wireContactForm();
  wireNewsletterForm();
  revealOnScroll();
});
