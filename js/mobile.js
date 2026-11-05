(() => {
  "use strict";

  function initMobileMenu() {
    document.querySelectorAll("header.header").forEach(header => {
      const nav = header.querySelector("nav");
      if (!nav || header.querySelector(".menu-toggle")) return;

      /* Hamburger button */
      const btn = document.createElement("button");
      btn.className = "menu-toggle";
      btn.type = "button";
      btn.setAttribute("aria-label", "Menu");
      btn.setAttribute("aria-expanded", "false");
      btn.innerHTML = "<span></span><span></span><span></span>";
      header.appendChild(btn);

      /* Dark overlay */
      const overlay = document.createElement("div");
      overlay.className = "menu-overlay";
      document.body.appendChild(overlay);

      const close = () => {
        document.body.classList.remove("menu-open");
        btn.setAttribute("aria-expanded", "false");
      };

      btn.addEventListener("click", () => {
        const open = document.body.classList.toggle("menu-open");
        btn.setAttribute("aria-expanded", String(open));
      });

      overlay.addEventListener("click", close);
      nav.addEventListener("click", e => { if (e.target.closest("a")) close(); });
      document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
      window.matchMedia("(min-width:761px)").addEventListener("change", close);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMobileMenu);
  } else {
    initMobileMenu();
  }
})();
