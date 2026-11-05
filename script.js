/* =========================================================
   Stephen Ochanda — Portfolio interactions
   ========================================================= */
(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none)").matches;

  /* Sticky header */
  const header = document.getElementById("siteHeader");
  const onScrollHeader = () => header.classList.toggle("scrolled", window.scrollY > 40);
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* Mobile nav */
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");
  const closeMenu = () => {
    navMenu.classList.remove("open");
    navToggle.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  };
  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("open");
    navToggle.classList.toggle("open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
  navMenu.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });

  /* Active nav link */
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".nav-link");
  const setActiveLink = () => {
    const pos = window.scrollY + 140;
    let id = "";
    sections.forEach((s) => { if (s.offsetTop <= pos) id = s.id; });
    navLinks.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + id));
  };
  window.addEventListener("scroll", setActiveLink, { passive: true });
  setActiveLink();

  /* Reveal */
  const revealEls = document.querySelectorAll(".reveal");
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("in-view"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in-view"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -50px 0px" });
    revealEls.forEach((el) => io.observe(el));
  }

  /* Counters */
  const counters = document.querySelectorAll("[data-count]");
  const animateCounter = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || "";
    if (prefersReducedMotion) { el.textContent = target + suffix; return; }
    const dur = 1600, start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ("IntersectionObserver" in window) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { animateCounter(e.target); co.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => co.observe(el));
  } else {
    counters.forEach(animateCounter);
  }

  /* Project filtering */
  const filterButtons = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".project-card");
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const f = btn.dataset.filter;
      filterButtons.forEach((b) => {
        b.classList.toggle("is-active", b === btn);
        b.setAttribute("aria-selected", String(b === btn));
      });
      projectCards.forEach((c) => {
        const cats = c.dataset.category.split(" ");
        c.classList.toggle("is-hidden", !(f === "all" || cats.includes(f)));
      });
    });
  });

  /* Modals */
  const modalButtons = document.querySelectorAll("[data-modal]");
  const modals = document.querySelectorAll(".modal-overlay");
  let lastFocused = null;
  const openModal = (id) => {
    const m = document.getElementById(id);
    if (!m) return;
    lastFocused = document.activeElement;
    m.hidden = false;
    requestAnimationFrame(() => m.classList.add("open"));
    document.body.style.overflow = "hidden";
    const c = m.querySelector(".modal-close");
    if (c) c.focus();
  };
  const closeModal = (m) => {
    m.classList.remove("open");
    document.body.style.overflow = "";
    setTimeout(() => { m.hidden = true; if (lastFocused) lastFocused.focus(); }, 400);
  };
  modalButtons.forEach((b) => b.addEventListener("click", () => openModal(b.dataset.modal)));
  modals.forEach((m) => {
    m.addEventListener("click", (e) => { if (e.target === m) closeModal(m); });
    const c = m.querySelector("[data-close]");
    if (c) c.addEventListener("click", () => closeModal(m));
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const open = document.querySelector(".modal-overlay.open");
      if (open) closeModal(open);
    }
  });

  /* Copy email */
  const copyBtn = document.getElementById("copyEmail");
  const copyFeedback = document.getElementById("copyFeedback");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const email = copyBtn.dataset.email;
      try { await navigator.clipboard.writeText(email); copyFeedback.textContent = "Copied!"; }
      catch {
        const t = document.createElement("textarea");
        t.value = email; document.body.appendChild(t); t.select();
        document.execCommand("copy"); document.body.removeChild(t);
        copyFeedback.textContent = "Copied!";
      }
      setTimeout(() => { copyFeedback.textContent = ""; }, 2200);
    });
  }

  /* Back to top */
  const toTop = document.getElementById("toTop");
  window.addEventListener("scroll", () => {
    toTop.classList.toggle("visible", window.scrollY > 600);
  }, { passive: true });
  toTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });

  /* Footer year */
  document.getElementById("year").textContent = new Date().getFullYear();

  /* Magnetic buttons */
  const magnetic = document.querySelectorAll(".magnetic");
  if (!prefersReducedMotion && !isTouch) {
    magnetic.forEach((btn) => {
      let rect = null;
      const update = () => { rect = btn.getBoundingClientRect(); };
      btn.addEventListener("mouseenter", update);
      btn.addEventListener("mousemove", (e) => {
        if (!rect) return;
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
      });
      btn.addEventListener("mouseleave", () => { btn.style.transform = ""; rect = null; });
    });
  }

  /* Hero orb parallax (subtle) */
  const orbs = document.querySelectorAll(".hero-orb, .hero-trail");
  if (!prefersReducedMotion && !isTouch && orbs.length) {
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          orbs.forEach((o, i) => {
            const speed = i % 2 === 0 ? 0.06 : -0.05;
            o.style.transform = `translateY(${y * speed}px)`;
          });
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }
})();
