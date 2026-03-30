(function () {
  const THEME_KEY = "portfolio-theme";
  const root = document.documentElement;
  const header = document.getElementById("site-header");
  const navToggle = document.getElementById("nav-toggle");
  const navLinks = document.getElementById("nav-links");
  const themeToggle = document.getElementById("theme-toggle");
  const mediaQuery = window.matchMedia ? window.matchMedia("(prefers-color-scheme: light)") : null;
  const isDutch = (root.getAttribute("lang") || "").toLowerCase().indexOf("nl") === 0;

  function getStoredTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (error) {
      return null;
    }
  }

  function getPreferredTheme() {
    return mediaQuery && mediaQuery.matches ? "light" : "dark";
  }

  function applyTheme(theme, persistPreference) {
    root.setAttribute("data-theme", theme);
    root.style.colorScheme = theme;

    if (themeToggle) {
      const nextTheme = theme === "dark" ? "light" : "dark";
      const ariaLabel = isDutch
        ? "Schakel naar " + (nextTheme === "light" ? "lichte" : "donkere") + " modus"
        : "Switch to " + nextTheme + " mode";

      themeToggle.setAttribute("aria-label", ariaLabel);
      themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
    }

    if (persistPreference) {
      try {
        localStorage.setItem(THEME_KEY, theme);
      } catch (error) {
        return;
      }
    }
  }

  function updateHeader() {
    if (!header) {
      return;
    }

    if (window.scrollY > 12) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }

  function closeMenu() {
    if (!navToggle || !navLinks) {
      return;
    }

    navToggle.setAttribute("aria-expanded", "false");
    navLinks.classList.remove("is-open");
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      const expanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!expanded));
      navLinks.classList.toggle("is-open");
    });

    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      const currentTheme = root.getAttribute("data-theme") || getStoredTheme() || getPreferredTheme();
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      applyTheme(nextTheme, true);
    });
  }

  function handleSystemThemeChange() {
    if (!getStoredTheme()) {
      applyTheme(getPreferredTheme(), false);
    }
  }

  if (mediaQuery && mediaQuery.addEventListener) {
    mediaQuery.addEventListener("change", handleSystemThemeChange);
  } else if (mediaQuery && mediaQuery.addListener) {
    mediaQuery.addListener(handleSystemThemeChange);
  }

  document.querySelectorAll(".btn").forEach(function (button) {
    button.addEventListener("mousemove", function (event) {
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      button.style.transform = "translateY(-2px) scale(1.02) translate(" + (x * 0.15) + "px, " + (y * 0.15) + "px)";
    });

    button.addEventListener("mouseleave", function () {
      button.style.transform = "";
    });
  });

  document.querySelectorAll(".section-header h2").forEach(function (title) {
    const text = title.textContent.trim();

    if (!text || title.querySelector("span")) {
      return;
    }

    title.classList.add("glitch-title");
    title.innerHTML = '<span data-text="' + text.replace(/"/g, "&quot;") + '">' + text + "</span>";
  });

  const photo = document.querySelector(".hero-card__photo--interactive");
  if (photo) {
    function launchFirework(clientX, clientY) {
      const rect = photo.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const colors = ["#00f5d4", "#9c8cff", "#ff7b8d", "#ffd166", "#eff4ff"];
      const bursts = 3;

      for (let burstIndex = 0; burstIndex < bursts; burstIndex += 1) {
        const burst = document.createElement("span");
        const burstX = Math.min(rect.width - 20, Math.max(20, x + (burstIndex - 1) * 34));
        const burstY = Math.min(rect.height - 20, Math.max(20, y - Math.abs(burstIndex - 1) * 12));

        burst.className = "hero-card__photo-burst";
        burst.style.left = burstX + "px";
        burst.style.top = burstY + "px";
        burst.style.color = colors[(Math.floor(Math.random() * colors.length) + burstIndex) % colors.length];

        for (let sparkIndex = 0; sparkIndex < 12; sparkIndex += 1) {
          const spark = document.createElement("span");
          spark.className = "hero-card__photo-spark";
          spark.style.setProperty("--angle", (sparkIndex * 30) + "deg");
          spark.style.setProperty("--distance", (34 + Math.random() * 24) + "px");
          spark.style.animationDelay = burstIndex * 60 + "ms";
          burst.appendChild(spark);
        }

        photo.appendChild(burst);
        window.setTimeout(function () {
          burst.remove();
        }, 950);
      }
    }

    photo.addEventListener("click", function (event) {
      launchFirework(event.clientX, event.clientY);
    });

    photo.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        const rect = photo.getBoundingClientRect();
        launchFirework(rect.left + rect.width / 2, rect.top + rect.height / 2);
      }
    });
  }

  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    reveals.forEach(function (item) {
      observer.observe(item);
    });
  } else {
    reveals.forEach(function (item) {
      item.classList.add("is-visible");
    });
  }

  requestAnimationFrame(function () {
    document.body.classList.add("is-ready");
  });

  applyTheme(root.getAttribute("data-theme") || getStoredTheme() || getPreferredTheme(), false);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
  window.addEventListener("resize", function () {
    if (window.innerWidth > 760) {
      closeMenu();
    }
  });
}());
