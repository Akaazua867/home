/**
 * Emmanuel Terngu Akaazua — Interactive Portfolio Script
 * Upgraded with GreenSock Animation Platform (GSAP), ScrollTrigger, and Lenis Smooth Scroll
 * Supports Light & Dark Theme Toggling and Scroll Management
 */

// 1. Instant theme restoration to prevent layout flash on load
(function () {
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
})();

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Register GSAP ScrollTrigger
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }

  // ==========================================================================
  // 2. LENIS SMOOTH SCROLL INTEGRATION & SCROLL LOCK
  // ==========================================================================
  let lenis;
  function initSmoothScroll() {
    if (typeof Lenis === "undefined" || prefersReducedMotion) return;

    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
      touchMultiplier: 1.4,
      infinite: false
    });

    // Lock scroll immediately for cinematic preloader
    lenis.stop();

    // Tie Lenis scrolling to GSAP ticker updates
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // Sync ScrollTrigger on scroll events
    lenis.on("scroll", ScrollTrigger.update);

    // Smooth scroll navigation anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener("click", function (e) {
        const href = this.getAttribute("href");
        const target = document.querySelector(href);
        if (!target || href === "#") return;
        e.preventDefault();
        
        lenis.scrollTo(target, { offset: -80 });
      });
    });
  }
  initSmoothScroll();

  // ==========================================================================
  // 3. THEME TOGGLER (Light / Dark Mode)
  // ==========================================================================
  function initThemeToggle() {
    const toggleBtn = document.getElementById("theme-toggle");
    if (!toggleBtn) return;

    const getCurrentTheme = () => document.documentElement.getAttribute("data-theme") || "dark";
    
    const setTheme = (theme) => {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
      
      // Update SVG icons inside toggle button
      const icon = toggleBtn.querySelector("svg");
      if (icon) {
        if (theme === "light") {
          // Switch to Sun icon
          icon.innerHTML = '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>';
        } else {
          // Switch to Moon icon
          icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
        }
      }
    };

    // Initial icon state sync
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);

    toggleBtn.addEventListener("click", () => {
      const current = getCurrentTheme();
      const nextTheme = current === "light" ? "dark" : "light";
      setTheme(nextTheme);
    });
  }
  initThemeToggle();

  // ==========================================================================
  // 4. CINEMATIC PRELOADER (GSAP-Powered)
  // ==========================================================================
  function initPreloader() {
    const preloader = document.getElementById("preloader");
    if (!preloader) return;

    const outerRing = preloader.querySelector(".movie-outer-ring");
    const innerRing = preloader.querySelector(".movie-inner-ring");
    const sweep = preloader.querySelector(".movie-sweep");
    const spiral = preloader.querySelector(".movie-spiral");
    const name = preloader.querySelector(".preloader-name");
    const line = preloader.querySelector(".preloader-line");
    const role = preloader.querySelector(".preloader-role");

    if (prefersReducedMotion || typeof gsap === "undefined") {
      document.body.classList.add("loaded");
      preloader.remove();
      if (lenis) lenis.start();
      initPageEntrance();
      return;
    }

    // Set initial styles for fallback safety
    gsap.set([line, role], { opacity: 0 });
    gsap.set(spiral, { strokeDashoffset: 1000 });
    gsap.set(sweep, { rotation: 0, transformOrigin: "50% 50%" });

    // Infinite rotation for the vintage countdown sweep line
    const sweepTween = gsap.to(sweep, {
      rotation: 360,
      transformOrigin: "50% 50%",
      duration: 2.0,
      repeat: -1,
      ease: "none"
    });

    // Infinite rotation for the inner spiral swirl (spinning counter-clockwise for vortex effect)
    const spiralTween = gsap.to(spiral, {
      rotation: -360,
      transformOrigin: "50% 50%",
      duration: 3.0,
      repeat: -1,
      ease: "none"
    });

    // GSAP Timeline for elegant cinematic loader
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(preloader, {
          yPercent: -100,
          duration: 0.8,
          ease: "power4.inOut",
          onComplete: () => {
            // Stop infinite tweens to save resources
            sweepTween.kill();
            spiralTween.kill();
            preloader.remove();
            document.body.classList.add("loaded");
            // Unlock scroll after loader slides away
            if (lenis) lenis.start();
            initPageEntrance();
          }
        });
      }
    });

    // 1. Draw geometric SVG spiral (swirl)
    tl.to(spiral, {
      strokeDashoffset: 0,
      duration: 1.5,
      ease: "power2.inOut"
    });

    // 2. Cinematic Focus on name (blur off, fade in, tracking letter-spacing expansion)
    tl.to(name, {
      opacity: 1,
      filter: "blur(0px)",
      letterSpacing: "0.15em",
      duration: 1.0,
      ease: "power3.out"
    }, "-=0.5");

    // 3. Expand line
    tl.to(line, {
      scaleX: 1,
      opacity: 1,
      duration: 0.5,
      ease: "power3.out"
    }, "-=0.6");

    // 4. Reveal role subtitle
    tl.to(role, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: "power2.out"
    }, "-=0.4");

    // 5. Luxury hold
    tl.to({}, { duration: 0.8 });
  }

  function initPageEntrance() {
    if (typeof gsap === "undefined" || prefersReducedMotion) {
      document.querySelectorAll(".hero-section .reveal-item").forEach(item => {
        item.classList.add("active");
      });
      document.querySelectorAll(".line-mask .line-text").forEach(el => {
        el.style.transform = "translateY(0)";
      });
      triggerHeroCounters();
      initScrollObserver();
      return;
    }

    // Set initial layout states
    gsap.set(".hero-section .reveal-item:not(.hero-headline)", { opacity: 0, y: 30 });
    gsap.set(".line-mask .line-text", { yPercent: 100 });

    const tl = gsap.timeline({
      onComplete: () => {
        document.querySelectorAll(".hero-section .reveal-item").forEach(item => {
          item.classList.add("active");
        });
      }
    });

    // 1. Text Mask reveals for main headline
    tl.to(".line-mask .line-text", {
      yPercent: 0,
      duration: 1.1,
      ease: "power4.out",
      stagger: 0.18
    });

    // 2. Animate other hero components in sequence
    const restItems = document.querySelectorAll(".hero-section .reveal-item:not(.hero-headline)");
    tl.to(restItems, {
      opacity: 1,
      y: 0,
      stagger: 0.12,
      duration: 0.8,
      ease: "power3.out",
      onStart: () => {
        setTimeout(triggerHeroCounters, 200);
      }
    }, "-=0.6");

    initScrollObserver();
  }

  initPreloader();

  // ==========================================================================
  // 5. MOUSE CURSOR GLOW
  // ==========================================================================
  function initCustomCursor() {
    const cursor = document.getElementById("custom-cursor");
    const glow = document.getElementById("cursor-glow");

    // Hide old mouse glow card
    if (glow) glow.style.display = "none";

    if (!cursor || window.matchMedia("(hover: none)").matches) return;

    // Set initial opacity to 0 to avoid rendering at (0,0) on page load
    cursor.style.opacity = "0";

    let mouseX = 0, mouseY = 0;
    let currentX = 0, currentY = 0;
    let hasMoved = false;
    const ease = 0.35; // Increased speed (from 0.18) for snappy, responsive tracking

    document.addEventListener("mousemove", (e) => {
      if (!hasMoved) {
        hasMoved = true;
        cursor.style.opacity = "1";
      }
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    // Hide cursor when leaving the window
    document.addEventListener("mouseleave", () => {
      cursor.style.opacity = "0";
    });

    // Show cursor when entering the window (if mouse has already moved once)
    document.addEventListener("mouseenter", () => {
      if (hasMoved) {
        cursor.style.opacity = "1";
      }
    });

    function update() {
      currentX += (mouseX - currentX) * ease;
      currentY += (mouseY - currentY) * ease;

      cursor.style.left = `${currentX}px`;
      cursor.style.top = `${currentY}px`;
      requestAnimationFrame(update);
    }
    requestAnimationFrame(update);

    // Expand cursor circle on links and interactive elements using event delegation
    document.addEventListener("mouseover", (e) => {
      const target = e.target;
      if (
        target.closest("a") ||
        target.closest("button") ||
        target.closest("select") ||
        target.closest("input") ||
        target.closest("textarea") ||
        target.closest("[data-cursor-hover]") ||
        target.closest(".carousel-dot") ||
        target.closest(".carousel-nav") ||
        target.closest(".work-case-card")
      ) {
        cursor.classList.add("cursor-hovered");
      } else {
        cursor.classList.remove("cursor-hovered");
      }
    });
  }
  initCustomCursor();

  // ==========================================================================
  // 6. MAGNETIC BUTTONS (GSAP-Powered Attraction)
  // ==========================================================================
  function initMagneticButtons() {
    if (typeof gsap === "undefined" || window.matchMedia("(hover: none)").matches || prefersReducedMotion) return;

    const magnetics = document.querySelectorAll(".btn, .navbar-logo, .nav-link, .direct-link, .theme-toggle");

    magnetics.forEach(el => {
      el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(el, {
          x: x * 0.35,
          y: y * 0.35,
          duration: 0.3,
          ease: "power2.out"
        });
      });

      el.addEventListener("mouseleave", () => {
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: "elastic.out(1, 0.3)"
        });
      });
    });
  }
  initMagneticButtons();

  // ==========================================================================
  // 7. INTERACTIVE GROWTH DASHBOARD
  // ==========================================================================
  const dashboardData = {
    meta: {
      reach: "100k+",
      ctr: "5.4%",
      roi: "4.8x",
      linePath: "M 0 70 Q 50 50 100 80 T 200 40 T 300 20",
      bgPath: "M 0 100 L 0 70 Q 50 50 100 80 T 200 40 T 300 20 L 300 100 Z"
    },
    google: {
      reach: "48k+",
      ctr: "6.2%",
      roi: "5.1x",
      linePath: "M 0 80 Q 50 60 100 40 T 200 50 T 300 15",
      bgPath: "M 0 100 L 0 80 Q 50 60 100 40 T 200 50 T 300 15 L 300 100 Z"
    },
    seo: {
      reach: "240k+",
      ctr: "3.8%",
      roi: "6.4x",
      linePath: "M 0 95 Q 50 90 100 70 T 200 35 T 300 10",
      bgPath: "M 0 100 L 0 95 Q 50 90 100 70 T 200 35 T 300 10 L 300 100 Z"
    }
  };

  function initGrowthDashboard() {
    const tabs = document.querySelectorAll(".dash-tab");
    const valReach = document.getElementById("dash-val-reach");
    const valCtr = document.getElementById("dash-val-ctr");
    const valRoi = document.getElementById("dash-val-roi");
    const pathLine = document.getElementById("chart-path-line");
    const pathBg = document.getElementById("chart-path-bg");

    if (!tabs.length || !valReach) return;

    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        const channel = tab.getAttribute("data-channel");
        if (!channel || !dashboardData[channel]) return;

        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");

        const data = dashboardData[channel];

        gsap.to([valReach, valCtr, valRoi], {
          opacity: 0.15,
          y: -5,
          duration: 0.15,
          onComplete: () => {
            valReach.textContent = data.reach;
            valCtr.textContent = data.ctr;
            valRoi.textContent = data.roi;

            gsap.to([valReach, valCtr, valRoi], {
              opacity: 1,
              y: 0,
              duration: 0.25,
              ease: "power2.out"
            });
          }
        });

        if (pathLine && pathBg) {
          pathLine.setAttribute("d", data.linePath);
          pathBg.setAttribute("d", data.bgPath);

          if (!prefersReducedMotion && typeof gsap !== "undefined") {
            const length = 600;
            gsap.fromTo(pathLine,
              { strokeDashoffset: length },
              { strokeDashoffset: 0, duration: 1.2, ease: "power2.out" }
            );
          }
        }
      });
    });
  }
  initGrowthDashboard();

  // ==========================================================================
  // 8. METRICS COUNTER ANIMATIONS
  // ==========================================================================
  function easeOutQuad(x) {
    return 1 - (1 - x) * (1 - x);
  }

  function animateNumber(element, start, end, duration) {
    let startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = easeOutQuad(progress);
      
      const currentValue = Math.floor(easedProgress * (end - start) + start);
      element.textContent = currentValue;

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        element.textContent = end;
      }
    }
    window.requestAnimationFrame(step);
  }

  function triggerHeroCounters() {
    const heroNumbers = document.querySelectorAll(".metric-number");
    heroNumbers.forEach(num => {
      const targetVal = parseInt(num.getAttribute("data-target"), 10);
      animateNumber(num, 0, targetVal, 1600);
    });
  }

  // ==========================================================================
  // 9. SCROLLTRIGGER SECTIONS REVEALS
  // ==========================================================================
  function initScrollObserver() {
    const revealItems = document.querySelectorAll(".reveal-item:not(.hero-section *)");
    const statNumbers = document.querySelectorAll(".stat-number");
    const statsSection = document.querySelector(".stats-section");

    if (prefersReducedMotion) {
      revealItems.forEach(item => item.classList.add("active"));
      statNumbers.forEach(num => {
        const targetVal = parseInt(num.getAttribute("data-target"), 10);
        num.textContent = targetVal;
      });
      return;
    }

    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      revealItems.forEach(item => {
        gsap.fromTo(item, 
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: item,
              start: "top 88%",
              toggleActions: "play none none none",
              onEnter: () => item.classList.add("active")
            }
          }
        );
      });

      if (statsSection && statNumbers.length) {
        ScrollTrigger.create({
          trigger: statsSection,
          start: "top 85%",
          onEnter: () => {
            statNumbers.forEach(num => {
              if (num.textContent === "0") {
                const targetVal = parseInt(num.getAttribute("data-target"), 10);
                animateNumber(num, 0, targetVal, 1800);
              }
            });
          }
        });
      }
    } else {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            if (entry.target.classList.contains("stats-section")) {
              statNumbers.forEach(num => {
                if (num.textContent === "0") {
                  const targetVal = parseInt(num.getAttribute("data-target"), 10);
                  animateNumber(num, 0, targetVal, 1800);
                }
              });
            }
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });

      revealItems.forEach(item => observer.observe(item));
      if (statsSection) observer.observe(statsSection);
    }
  }

  // ==========================================================================
  // 11. 3D CARD TILT EFFECT
  // ==========================================================================
  function init3DTilt() {
    const tiltCards = document.querySelectorAll("[data-tilt]");
    if (!tiltCards.length || window.matchMedia("(hover: none)").matches || prefersReducedMotion) return;

    tiltCards.forEach(card => {
      card.style.transformStyle = "preserve-3d";
      
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        const tiltX = -y * 8;
        const tiltY = x * 8;

        if (typeof gsap !== "undefined") {
          gsap.to(card, {
            rotateX: tiltX,
            rotateY: tiltY,
            transformPerspective: 1000,
            duration: 0.3,
            ease: "power2.out"
          });
        } else {
          card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
        }
      });

      card.addEventListener("mouseleave", () => {
        if (typeof gsap !== "undefined") {
          gsap.to(card, {
            rotateX: 0,
            rotateY: 0,
            duration: 0.5,
            ease: "power2.out"
          });
        } else {
          card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
        }
      });
    });
  }
  init3DTilt();

  // ==========================================================================
  // 12. NAVIGATION & HAMBURGER SYSTEM
  // ==========================================================================
  function initNavigation() {
    const navbar = document.getElementById("navbar");
    const hamburgerToggle = document.getElementById("hamburger-toggle");
    const mobileMenuOverlay = document.getElementById("mobile-menu-overlay");
    const mobileMenuClose = document.getElementById("mobile-menu-close");
    const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");

    if (!navbar || !hamburgerToggle) return;

    function toggleMobileMenu() {
      const isExpanded = hamburgerToggle.getAttribute("aria-expanded") === "true";
      hamburgerToggle.setAttribute("aria-expanded", !isExpanded);
      hamburgerToggle.classList.toggle("active");
      mobileMenuOverlay.classList.toggle("active");
      document.body.style.overflow = isExpanded ? "unset" : "hidden";
      
      if (typeof lenis !== "undefined" && lenis) {
        if (isExpanded) {
          lenis.start();
        } else {
          lenis.stop();
        }
      }
    }

    function closeMobileMenu() {
      hamburgerToggle.setAttribute("aria-expanded", "false");
      hamburgerToggle.classList.remove("active");
      mobileMenuOverlay.classList.remove("active");
      document.body.style.overflow = "unset";
      
      if (typeof lenis !== "undefined" && lenis) {
        lenis.start();
      }
    }

    hamburgerToggle.addEventListener("click", toggleMobileMenu);
    mobileMenuClose.addEventListener("click", closeMobileMenu);
    mobileNavLinks.forEach(link => link.addEventListener("click", closeMobileMenu));

    // Escape key closes mobile menu
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && mobileMenuOverlay.classList.contains("active")) {
        closeMobileMenu();
      }
    });

    let lastScrollY = window.scrollY;

    window.addEventListener("scroll", () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY <= 80) {
        navbar.classList.remove("nav-hidden");
        return;
      }

      if (currentScrollY > lastScrollY) {
        navbar.classList.add("nav-hidden");
      } else {
        navbar.classList.remove("nav-hidden");
      }
      lastScrollY = currentScrollY;
    }, { passive: true });

    const navLinks = document.querySelectorAll(".nav-link");
    const sections = document.querySelectorAll("section[id]");

    window.addEventListener("scroll", () => {
      let currentActiveId = "";
      const scrollPosition = window.scrollY + 180;

      sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        if (scrollPosition >= top && scrollPosition < top + height) {
          currentActiveId = section.getAttribute("id");
        }
      });

      navLinks.forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${currentActiveId}`) {
          link.classList.add("active");
        }
      });
    }, { passive: true });
  }
  initNavigation();

  // ==========================================================================
  // 13. CLICK SPARKS PARTICLES EFFECT
  // ==========================================================================
  function initClickSparks() {
    if (prefersReducedMotion) return;

    document.addEventListener("click", (e) => {
      const target = e.target;
      if (target.closest("input") || target.closest("textarea") || target.closest("select")) return;

      const x = e.pageX;
      const y = e.pageY;
      const particleCount = 8;
      const colors = ["#ffffff", "#cbd5e1", "#94a3b8", "#e2e8f0"];

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("div");
        particle.className = "click-particle";
        particle.style.position = "absolute";
        particle.style.width = "4px";
        particle.style.height = "4px";
        particle.style.borderRadius = "50%;";
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.pointerEvents = "none";
        particle.style.zIndex = "10000";
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;

        document.body.appendChild(particle);

        const angle = (i * (360 / particleCount)) * (Math.PI / 180);
        const velocity = 35 + Math.random() * 15;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;

        const anim = particle.animate([
          { transform: "translate(-50%, -50%) scale(1) translate(0px, 0px)", opacity: 1 },
          { transform: `translate(-50%, -50%) scale(0.2) translate(${tx}px, ${ty}px)`, opacity: 0 }
        ], {
          duration: 500,
          easing: "cubic-bezier(0.25, 1, 0.5, 1)"
        });

        anim.onfinish = () => particle.remove();
      }
    });
  }
  initClickSparks();

  // ==========================================================================
  // 14. SCROLL PROGRESS TRACKER
  // ==========================================================================
  function initScrollProgress() {
    const bar = document.getElementById("scroll-progress");
    if (!bar) return;

    window.addEventListener("scroll", () => {
      const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = winScroll / height;
      bar.style.transform = `scaleX(${scrolled})`;
    }, { passive: true });
  }
  initScrollProgress();

  // ==========================================================================
  // 15. FORM SUBMISSION HANDLING (Web3Forms AJAX Integration)
  // ==========================================================================
  function initContactForm() {
    const form = document.getElementById("contact-form");
    const successMsg = document.getElementById("form-success-msg");

    if (!form || !successMsg) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const projectType = document.getElementById("project-type").value;
      const message = document.getElementById("message").value.trim();

      if (!name || !email || !projectType || !message) {
        successMsg.style.color = "#ef4444";
        successMsg.textContent = "✗ Please fill out all required fields.";
        successMsg.classList.add("show");
        return;
      }

      // Intercept default demo access key
      const accessKeyInput = form.querySelector('input[name="access_key"]');
      if (accessKeyInput && accessKeyInput.value === "YOUR_ACCESS_KEY_HERE") {
        successMsg.style.color = "#ef4444";
        successMsg.innerHTML = "✗ Webform is in demo mode (missing access key). Please send an email directly using the options on the left.";
        successMsg.classList.add("show");
        setTimeout(() => {
          successMsg.classList.remove("show");
        }, 8000);
        return;
      }

      const submitBtn = form.querySelector(".btn-submit");
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";

      const formData = new FormData(form);

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      })
      .then(async (response) => {
        const json = await response.json();
        if (response.status === 200) {
          successMsg.style.color = "var(--text-primary)";
          successMsg.textContent = "✓ Message sent! I will respond within 24 hours.";
          successMsg.classList.add("show");
          form.reset();
        } else {
          console.error("Web3Forms Error:", json);
          successMsg.style.color = "#ef4444";
          successMsg.textContent = json.message || "✗ Something went wrong. Please try again.";
          successMsg.classList.add("show");
        }
      })
      .catch((error) => {
        console.error("Network Error:", error);
        successMsg.style.color = "#ef4444";
        successMsg.textContent = "✗ Network error. Please try again later.";
        successMsg.classList.add("show");
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        setTimeout(() => {
          successMsg.classList.remove("show");
        }, 5000);
      });
    });
  }
  initContactForm();

  // ==========================================================================
  // 15a. FORM CHARACTER COUNT LIMIT CUES
  // ==========================================================================
  function initFormCharCount() {
    const textarea = document.getElementById("message");
    const counter = document.getElementById("message-char-count");
    if (!textarea || !counter) return;

    textarea.addEventListener("input", () => {
      const length = textarea.value.length;
      counter.textContent = `${length} / 500`;
      
      if (length >= 480) {
        counter.style.color = "var(--accent)";
      } else {
        counter.style.color = "var(--text-muted)";
      }
    });

    const form = document.getElementById("contact-form");
    if (form) {
      form.addEventListener("reset", () => {
        counter.textContent = "0 / 500";
        counter.style.color = "var(--text-muted)";
      });
    }
  }
  initFormCharCount();

  // ==========================================================================
  // 15b. COPY EMAIL TO CLIPBOARD FEATURE
  // ==========================================================================
  function initCopyEmail() {
    const copyBtn = document.getElementById("btn-copy-email");
    if (!copyBtn) return;

    const emailAddress = "emmanuelakaazua2@gmail.com";

    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(emailAddress)
        .then(() => {
          copyBtn.textContent = "Copied! ✓";
          copyBtn.classList.add("copied");
          
          setTimeout(() => {
            copyBtn.textContent = "Copy Email Address";
            copyBtn.classList.remove("copied");
          }, 3000);
        })
        .catch(err => {
          console.error("Clipboard copy failed: ", err);
          // Fallback in case clipboard API isn't supported / allowed
          const tempInput = document.createElement("input");
          tempInput.value = emailAddress;
          document.body.appendChild(tempInput);
          tempInput.select();
          try {
            document.execCommand("copy");
            copyBtn.textContent = "Copied! ✓";
            copyBtn.classList.add("copied");
            setTimeout(() => {
              copyBtn.textContent = "Copy Email Address";
              copyBtn.classList.remove("copied");
            }, 3000);
          } catch (e) {
            copyBtn.textContent = "Copy Failed ✗";
          }
          document.body.removeChild(tempInput);
        });
    });
  }
  initCopyEmail();



  // ==========================================================================
  // 17. ACHIEVEMENTS TEXT POPUPS PREVIEW SYSTEM
  // ==========================================================================
  function initTextPopups() {
    const preview = document.getElementById("text-popup-preview");
    if (!preview) return;

    const img = preview.querySelector("img");
    const triggers = document.querySelectorAll(".text-popup-trigger");

    if (!img || !triggers.length) return;

    triggers.forEach(trigger => {
      trigger.addEventListener("mouseenter", () => {
        const imageSrc = trigger.getAttribute("data-preview");
        if (!imageSrc) return;
        img.src = imageSrc;
        preview.classList.add("active");
      });

      trigger.addEventListener("mousemove", (e) => {
        // Offset slightly from cursor coordinates
        preview.style.left = `${e.clientX}px`;
        preview.style.top = `${e.clientY}px`;
      });

      trigger.addEventListener("mouseleave", () => {
        preview.classList.remove("active");
      });
    });
  }
  initTextPopups();
  
  // ==========================================================================
  // 17b. CASE STUDY MODAL CONTROLLER
  // ==========================================================================
  const projectData = {
    meetsession: {
      title: "MEETSESSION",
      category: "Performance Marketing & Content Strategy",
      image: [
        "images/Devon-images/devon1.jpeg",
        "images/Devon-images/devon2.jpeg",
        "images/Devon-images/devon4.jpeg"
      ],
      description: "An AI transcription app that converts speech to text and also provides summaries of conversations, meetings, and recordings.",
      challenge: "Low initial user activation due to high product complexity.",
      action: "Designed a simplified onboarding flow and targeted social campaign tutorials.",
      result: "Grew weekly active users from 0 to 500 in the first 30 days.",
      liveUrl: ""
    },
    wanahomes: {
      title: "Wana Homes",
      category: "Brand Identity & Print Design",
      image: [
        "images/wana-homes/wana1.jpeg",
        "images/wana-homes/wana2.jpeg",
        "images/wana-homes/wana3.jpeg",
        "images/wana-homes/wana4.jpeg",
        "images/wana-homes/wana5.jpeg"
      ],
      description: "A real estate agency focusing on modern residential properties.",
      challenge: "Inconsistent visual branding across channels diluted brand trust.",
      action: "Designed a cohesive brand system, digital templates, and physical print assets.",
      result: "Launched a unified brand presence across web, social, and print materials.",
      liveUrl: ""
    },
    stoneoak: {
      title: "Stone Oak",
      category: "Corporate Identity & Design Systems",
      image: [
        "images/stone-oak/stoneoak1.jpeg",
        "images/stone-oak/stoneoak2.jpeg"
      ],
      description: "A premium corporate brand offering corporate consulting services.",
      challenge: "Dated marketing assets failed to reflect high-ticket consulting value.",
      action: "Developed an executive typography standard, layout systems, and print assets.",
      result: "Established a premium editorial brand identity that supported high-value consulting bids.",
      liveUrl: ""
    }
  };

  function initProjectModalCaseStudy() {
    const modal = document.getElementById("case-study-modal");
    if (!modal) return;

    const modalGallery = document.getElementById("modal-gallery");
    const modalDots = document.getElementById("modal-gallery-dots");
    const modalEyebrow = document.getElementById("modal-eyebrow");
    const modalTitle = document.getElementById("modal-title");
    const modalDesc = document.getElementById("modal-desc");
    const modalChallenge = document.getElementById("modal-challenge");
    const modalAction = document.getElementById("modal-action");
    const modalResult = document.getElementById("modal-result");
    const modalLinkContainer = document.getElementById("modal-link-container");
    const modalLink = document.getElementById("modal-link");
    const closeBtn = modal.querySelector(".modal-close");
    const scrollBtn = document.getElementById("modal-scroll-btn");
    const scrollTopBtn = document.getElementById("modal-scroll-top-btn");
 
    let lastFocusedEl = null;
    let activeProjectImages = [];
 
    function openModal(projectKey, triggerEl) {
      const data = projectData[projectKey];
      if (!data) return;
 
      lastFocusedEl = triggerEl;
 
      // Populate dynamic horizontal gallery images
      if (modalGallery) {
        modalGallery.scrollLeft = 0; // Reset gallery scroll position to first image
        modalGallery.innerHTML = ""; // Clear existing images
        if (modalDots) modalDots.innerHTML = ""; // Clear existing dots
        
        const images = Array.isArray(data.image) ? data.image : [data.image];
        activeProjectImages = images;
        images.forEach((imgUrl, index) => {
          const img = document.createElement("img");
          img.src = imgUrl;
          img.alt = `${data.title} Case Study Image ${index + 1}`;
          img.className = "modal-gallery-img";
          img.loading = "lazy";
          modalGallery.appendChild(img);
          
          // Generate slide dots
          if (images.length > 1 && modalDots) {
            const dot = document.createElement("button");
            dot.className = `modal-gallery-dot${index === 0 ? " active" : ""}`;
            dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
            dot.addEventListener("click", () => {
              const slideWidth = modalGallery.clientWidth;
              modalGallery.scrollTo({
                left: slideWidth * index,
                behavior: "smooth"
              });
            });
            modalDots.appendChild(dot);
          }
        });
        
        // Listen to horizontal scrolling to toggle active dot
        if (images.length > 1 && modalDots) {
          modalGallery.addEventListener("scroll", () => {
            const slideWidth = modalGallery.clientWidth;
            if (slideWidth === 0) return;
            const activeIndex = Math.round(modalGallery.scrollLeft / slideWidth);
            const dots = modalDots.querySelectorAll(".modal-gallery-dot");
            dots.forEach((dot, dotIdx) => {
              if (dotIdx === activeIndex) {
                dot.classList.add("active");
              } else {
                dot.classList.remove("active");
              }
            });
          });
        }
      }

      if (modalEyebrow) modalEyebrow.textContent = data.category;
      if (modalTitle) modalTitle.textContent = data.title;
      if (modalDesc) modalDesc.textContent = data.description;
      if (modalChallenge) modalChallenge.textContent = data.challenge;
      if (modalAction) modalAction.textContent = data.action;
      if (modalResult) modalResult.textContent = data.result;
 
      if (modalLinkContainer && modalLink) {
        if (data.liveUrl) {
          modalLink.href = data.liveUrl;
          modalLinkContainer.style.display = "block";
        } else {
          modalLinkContainer.style.display = "none";
        }
      }
 
      // Reset scroll position on opening
      modal.scrollTop = 0;
 
      // Open transition
      modal.classList.add("active");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      if (typeof lenis !== "undefined" && lenis) {
        lenis.stop();
      }
 
      // Check if content is scrollable to display scroll button
      setTimeout(() => {
        if (scrollBtn) {
          if (modal.scrollHeight > modal.clientHeight + 40) {
            scrollBtn.style.opacity = "1";
            scrollBtn.style.pointerEvents = "auto";
          } else {
            scrollBtn.style.opacity = "0";
            scrollBtn.style.pointerEvents = "none";
          }
        }
      }, 350);
 
      // Focus close button for accessibility
      if (closeBtn) {
        setTimeout(() => closeBtn.focus(), 50);
      }
    }
 
    function closeModal() {
      modal.classList.remove("active");
      modal.setAttribute("aria-hidden", "true");
      activeProjectImages = [];
      document.body.style.overflow = "";
      if (typeof lenis !== "undefined" && lenis) {
        lenis.start();
      }
 
      if (scrollBtn) {
        scrollBtn.style.opacity = "0";
        scrollBtn.style.pointerEvents = "none";
      }

      if (scrollTopBtn) {
        scrollTopBtn.classList.remove("visible");
      }
 
      // Restore focus to card trigger
      if (lastFocusedEl) {
        setTimeout(() => lastFocusedEl.focus(), 50);
      }
    }
 
    // Attach click events to cards
    document.querySelectorAll(".work-case-card").forEach(card => {
      card.addEventListener("click", () => {
        const projectKey = card.getAttribute("data-project");
        openModal(projectKey, card);
      });
    });
 
    // Close button click
    if (closeBtn) {
      closeBtn.addEventListener("click", closeModal);
    }
 
    // Click outside wrapper closes modal
    modal.addEventListener("click", (e) => {
      if (e.target === modal || !e.target.closest(".modal-wrapper")) {
        closeModal();
      }
    });
 
    // Listen to scroll to fade out scroll button and show scroll-to-top button
    modal.addEventListener("scroll", () => {
      if (scrollBtn) {
        const opacity = Math.max(0, 1 - modal.scrollTop / 150);
        scrollBtn.style.opacity = opacity;
        if (opacity === 0) {
          scrollBtn.style.pointerEvents = "none";
        } else {
          scrollBtn.style.pointerEvents = "auto";
        }
      }
      if (scrollTopBtn) {
        if (modal.scrollTop > 300) {
          scrollTopBtn.classList.add("visible");
        } else {
          scrollTopBtn.classList.remove("visible");
        }
      }
    });
 
    // Scroll button click behavior
    if (scrollBtn) {
      scrollBtn.addEventListener("click", () => {
        const modalHero = modal.querySelector(".modal-hero");
        const targetScroll = modalHero ? modalHero.offsetHeight - 40 : 300;
        modal.scrollTo({
          top: targetScroll,
          behavior: "smooth"
        });
      });
    }

    // Scroll to top button click behavior
    if (scrollTopBtn) {
      scrollTopBtn.addEventListener("click", () => {
        modal.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      });
    }

    // Escape key & Tab trapping
    document.addEventListener("keydown", (e) => {
      if (!modal.classList.contains("active")) return;

      if (e.key === "Escape") {
        closeModal();
        return;
      }

      if (e.key === "ArrowLeft") {
        if (activeProjectImages.length > 1 && modalGallery) {
          const slideWidth = modalGallery.clientWidth;
          if (slideWidth > 0) {
            const activeIndex = Math.round(modalGallery.scrollLeft / slideWidth);
            if (activeIndex > 0) {
              modalGallery.scrollTo({
                left: slideWidth * (activeIndex - 1),
                behavior: "smooth"
              });
              e.preventDefault();
            }
          }
        }
      }

      if (e.key === "ArrowRight") {
        if (activeProjectImages.length > 1 && modalGallery) {
          const slideWidth = modalGallery.clientWidth;
          if (slideWidth > 0) {
            const activeIndex = Math.round(modalGallery.scrollLeft / slideWidth);
            if (activeIndex < activeProjectImages.length - 1) {
              modalGallery.scrollTo({
                left: slideWidth * (activeIndex + 1),
                behavior: "smooth"
              });
              e.preventDefault();
            }
          }
        }
      }

      if (e.key === "Tab") {
        const focusables = Array.from(modal.querySelectorAll("button, a")).filter(el => {
          return el.tabIndex !== -1 && (el.offsetWidth > 0 || el.offsetHeight > 0);
        });

        if (focusables.length === 0) return;

        const firstFocusable = focusables[0];
        const lastFocusable = focusables[focusables.length - 1];

        if (e.shiftKey) { // Shift + Tab
          if (document.activeElement === firstFocusable) {
            lastFocusable.focus();
            e.preventDefault();
          }
        } else { // Tab
          if (document.activeElement === lastFocusable) {
            firstFocusable.focus();
            e.preventDefault();
          }
        }
      }
    });
  }
  initProjectModalCaseStudy();

  // 18. IMAGE PRE-FETCHING FOR CASE STUDIES
  function prefetchCaseStudyImages() {
    window.addEventListener("load", () => {
      Object.keys(projectData).forEach(key => {
        const images = Array.isArray(projectData[key].image) ? projectData[key].image : [projectData[key].image];
        images.forEach(imgUrl => {
          if (imgUrl) {
            const img = new Image();
            img.src = imgUrl;
          }
        });
      });
    });
  }
  prefetchCaseStudyImages();

  // ==========================================================================
  // 19. MAIN PAGE SCROLL-TO-TOP BUTTON
  // ==========================================================================
  function initPageScrollTop() {
    const pageScrollTopBtn = document.getElementById("page-scroll-top-btn");
    if (!pageScrollTopBtn) return;

    window.addEventListener("scroll", () => {
      // Show button after 500px scroll depth
      if (window.scrollY > 500) {
        pageScrollTopBtn.classList.add("visible");
      } else {
        pageScrollTopBtn.classList.remove("visible");
      }
    }, { passive: true });

    pageScrollTopBtn.addEventListener("click", () => {
      if (typeof lenis !== "undefined" && lenis) {
        lenis.scrollTo(0);
      } else {
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      }
    });
  }
  initPageScrollTop();
});
