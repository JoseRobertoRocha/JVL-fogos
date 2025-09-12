document.addEventListener("DOMContentLoaded", () => {
  // Atualiza ano
  const yearEl = document.getElementById("y");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ====== MENU HAMBURGUER ======
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");
  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("show");
    });
    navLinks.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => navLinks.classList.remove("show"));
    });
  }

  // ====== POPUP ======
  const popup = document.getElementById("popup");
  const popupText = document.getElementById("popup-text");
  const popupTitle = document.getElementById("popup-title");
  const popupClose = document.getElementById("popup-close");

  document.querySelectorAll(".btn[data-info]").forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      popupText.textContent = btn.getAttribute("data-info");
      const titleEl = btn.closest(".info-card").querySelector("h2");
      if (titleEl) popupTitle.textContent = titleEl.textContent;
      popup.classList.add("show");
    });
  });

  if (popupClose) popupClose.addEventListener("click", () => popup.classList.remove("show"));
  popup.addEventListener("click", e => { if (e.target === popup) popup.classList.remove("show"); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") popup.classList.remove("show"); });
});