document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("booking-modal");
  const bookingForm = document.getElementById("booking-form");
  const packageSelect = document.getElementById("package-select");
  const bookingDate = document.getElementById("booking-date");
  const formMessage = document.getElementById("form-message");
  const openButtons = document.querySelectorAll("[data-open-booking]");
  const closeButtons = document.querySelectorAll("[data-close-booking]");
  const revealItems = document.querySelectorAll("[data-reveal]");
  let lastFocusedElement = null;

  const focusableSelector =
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

  const setMinDate = () => {
    if (!bookingDate) {
      return;
    }

    const today = new Date();
    const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0];

    bookingDate.min = localDate;
  };

  const openModal = (selectedPackage = "") => {
    if (!modal) {
      return;
    }

    lastFocusedElement = document.activeElement;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    if (packageSelect) {
      packageSelect.value = selectedPackage || "";
    }

    if (formMessage) {
      formMessage.textContent = "";
    }

    const firstInput = modal.querySelector("input, select");
    if (firstInput) {
      firstInput.focus();
    }
  };

  const closeModal = () => {
    if (!modal) {
      return;
    }

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");

    if (lastFocusedElement instanceof HTMLElement) {
      lastFocusedElement.focus();
    }
  };

  openButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedPackage = button.dataset.package || "";
      openModal(selectedPackage);
    });
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (event) => {
    if (!modal || !modal.classList.contains("is-open")) {
      return;
    }

    if (event.key === "Escape") {
      closeModal();
      return;
    }

    if (event.key === "Tab") {
      const focusableElements = Array.from(
        modal.querySelectorAll(focusableSelector)
      ).filter((element) => !element.hasAttribute("disabled"));

      if (focusableElements.length === 0) {
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  });

  if (bookingForm && formMessage) {
    bookingForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const formData = new FormData(bookingForm);
      const patientName = formData.get("name")?.toString().trim() || "Patient";
      const chosenPackage = formData.get("package")?.toString().trim() || "selected package";
      const appointmentDate = formData.get("date")?.toString().trim() || "your chosen date";

      formMessage.textContent =
        `Thank you, ${patientName}. Your request for ${chosenPackage} on ${appointmentDate} has been recorded.`;

      bookingForm.reset();
      setMinDate();

      window.setTimeout(() => {
        closeModal();
      }, 1200);
    });
  }

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 0.05, 0.35)}s`;
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
      { threshold: 0.14 }
    );

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  setMinDate();
});
