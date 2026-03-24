document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const menuToggle = document.querySelector(".menu-toggle");
  const siteNav = document.getElementById("site-nav");
  const form = document.getElementById("lead-form");
  const formNote = document.getElementById("form-note");
  const year = document.getElementById("year");
  const revealItems = document.querySelectorAll("[data-reveal]");

  const updateHeader = () => {
    if (!header) {
      return;
    }

    header.classList.toggle("is-scrolled", window.scrollY > 10);
  };

  const setMenuState = (open) => {
    if (!menuToggle || !siteNav) {
      return;
    }

    menuToggle.setAttribute("aria-expanded", String(open));
    siteNav.dataset.open = String(open);
    document.body.classList.toggle("nav-open", open);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  if (menuToggle && siteNav) {
    setMenuState(false);

    menuToggle.addEventListener("click", () => {
      setMenuState(siteNav.dataset.open !== "true");
    });

    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenuState(false));
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 820) {
        setMenuState(false);
      }
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const targetId = anchor.getAttribute("href");
      if (!targetId || targetId === "#") {
        return;
      }

      const target = document.querySelector(targetId);
      if (!target) {
        return;
      }

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 0.05, 0.3)}s`;
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, revealObserver) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  if (form && formNote) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const nameField = form.querySelector('input[name="name"]');
      const userName = nameField && nameField.value.trim() ? nameField.value.trim() : "Patient";

      formNote.textContent = `Thanks, ${userName}. Your callback request for Labprix Diagnostics Centre has been captured on this demo website.`;
      form.reset();
    });
  }

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }
});
