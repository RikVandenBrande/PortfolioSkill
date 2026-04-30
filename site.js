(function () {
  const THEME_KEY = "portfolio-theme";
  const PAGE_TRANSITION_KEY = "portfolio-page-transition";
  const root = document.documentElement;
  const header = document.getElementById("site-header");
  const navToggle = document.getElementById("nav-toggle");
  const navLinks = document.getElementById("nav-links");
  const themeToggle = document.getElementById("theme-toggle");
  const mediaQuery = window.matchMedia ? window.matchMedia("(prefers-color-scheme: light)") : null;
  const isDutch = (root.getAttribute("lang") || "").toLowerCase().indexOf("nl") === 0;
  let themeShiftTimer = null;
  let pageTransitionTimer = null;

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

  function triggerThemeShift() {
    if (!document.body) {
      return;
    }

    document.body.classList.remove("is-theme-shifting");
    void document.body.offsetWidth;
    document.body.classList.add("is-theme-shifting");

    if (themeShiftTimer) {
      window.clearTimeout(themeShiftTimer);
    }

    themeShiftTimer = window.setTimeout(function () {
      document.body.classList.remove("is-theme-shifting");
    }, 760);
  }

  function setTransitionState(className, duration) {
    if (!document.body) {
      return;
    }

    document.body.classList.remove("is-theme-shifting", "is-page-leaving", "is-page-arriving");

    if (className) {
      void document.body.offsetWidth;
      document.body.classList.add(className);
    }

    if (pageTransitionTimer) {
      window.clearTimeout(pageTransitionTimer);
      pageTransitionTimer = null;
    }

    if (className && duration) {
      pageTransitionTimer = window.setTimeout(function () {
        document.body.classList.remove(className);
      }, duration);
    }
  }

  function markIncomingTransition() {
    try {
      sessionStorage.setItem(PAGE_TRANSITION_KEY, String(Date.now()));
    } catch (error) {
      return;
    }
  }

  function consumeIncomingTransition() {
    try {
      const value = sessionStorage.getItem(PAGE_TRANSITION_KEY);

      if (!value) {
        return false;
      }

      sessionStorage.removeItem(PAGE_TRANSITION_KEY);
      return Date.now() - Number(value) < 2400;
    } catch (error) {
      return false;
    }
  }

  function isInternalPageLink(link) {
    if (!link || !link.href) {
      return false;
    }

    if (link.hasAttribute("download") || link.target === "_blank") {
      return false;
    }

    const href = link.getAttribute("href") || "";
    if (!href || href.charAt(0) === "#" || href.indexOf("mailto:") === 0 || href.indexOf("tel:") === 0) {
      return false;
    }

    const url = new URL(link.href, window.location.href);
    const isSameOrigin = url.origin === window.location.origin;
    const isHtmlPage = /\.html(?:#.*)?$/i.test(url.pathname + url.hash) || /\/$/.test(url.pathname);
    const isSamePageHashOnly = url.pathname === window.location.pathname && url.search === window.location.search && url.hash;

    return isSameOrigin && isHtmlPage && !isSamePageHashOnly;
  }

  function bindPageTransitions() {
    document.addEventListener("click", function (event) {
      const target = event.target;
      const link = target && target.closest ? target.closest("a[href]") : null;

      if (!link || !isInternalPageLink(link)) {
        return;
      }

      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      if (document.body.classList.contains("is-page-leaving")) {
        event.preventDefault();
        return;
      }

      const destination = link.href;
      closeMenu();
      markIncomingTransition();
      setTransitionState("is-page-leaving", 720);

      event.preventDefault();
      window.setTimeout(function () {
        window.location.href = destination;
      }, 520);
    }, true);
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
      triggerThemeShift();
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

  // Photo interaction removed intentionally (zoom / interactive bursts caused layout/overlay issues).
  // Previously there was a click / keyboard handler that added decorative bursts inside the
  // header photo. The feature was removed because it interfered with page scrolling and
  // produced an overlay-like effect. Keeping this comment as a record of the change.


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

  if (consumeIncomingTransition()) {
    setTransitionState("is-page-arriving", 820);
  }

  applyTheme(root.getAttribute("data-theme") || getStoredTheme() || getPreferredTheme(), false);
  bindPageTransitions();
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
  window.addEventListener("resize", function () {
    if (window.innerWidth > 760) {
      closeMenu();
    }
  });
  window.addEventListener("pageshow", function () {
    document.body.classList.remove("is-page-leaving");
  });
}());
