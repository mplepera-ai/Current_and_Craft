/* Current & Craft public marketing-site analytics.
 * Non-advertising GA4: sanitized page views, product discovery/launch clicks,
 * navigation, and coarse scroll milestones. No form contents or app data.
 * Visitors can opt out at /privacy.html. The separate apps are NOT instrumented here.
 */
(() => {
  "use strict";

  const ID = "G-64ZL6JMETJ";
  const KEY = "cc-analytics-optout-v2";
  const HOSTS = ["currentandcraft.net", "www.currentandcraft.net"];
  const live = HOSTS.includes(location.hostname);
  const titles = {
    home: "Current & Craft | Company",
    games: "Current & Craft | Games & Apps",
    engineering: "Current & Craft | Engineering Software",
    privacy: "Current & Craft | Website Privacy Notice"
  };
  const productCategories = {
    CommonSlate: "Entertainment",
    "Curious Cove": "Entertainment",
    "Incident Lab": "Entertainment",
    StormRoute: "Engineering",
    Reamwright: "Engineering",
    Copestone: "Engineering",
    Tiedown: "Engineering",
    SiteConnect: "Engineering",
    LiftWorks: "Engineering",
    Mainline: "Engineering"
  };

  let allowed = false;
  let loaded = false;
  let pageName = "";
  window.ccAnalyticsAllowed = false;

  function savedOptOut() {
    try {
      const preference = localStorage.getItem(KEY);
      if (preference === "no") return true;
      if (preference === "yes") return false;
      return localStorage.getItem("cc-marketing-consent-v1") === "no";
    } catch (_) {
      return false;
    }
  }

  function store(value) {
    try { localStorage.setItem(KEY, value); } catch (_) { /* Storage may be blocked. */ }
  }

  function pageUrl() {
    return location.origin + location.pathname;
  }

  function safeReferrer() {
    try {
      if (!document.referrer) return "";
      const url = new URL(document.referrer);
      return url.protocol === "https:" || url.protocol === "http:" ? url.origin + "/" : "";
    } catch (_) {
      return "";
    }
  }

  function gtag() {
    window.dataLayer.push(arguments);
  }

  function canTrack() {
    return live && allowed && loaded && !savedOptOut();
  }

  function sendEvent(name, parameters) {
    if (!canTrack()) return;
    gtag("event", name, Object.assign({
      site_section: pageName,
      page_location: pageUrl(),
      page_referrer: safeReferrer()
    }, parameters || {}));
  }

  function sendPage() {
    if (!titles[pageName]) return;
    sendEvent("page_view", { page_title: titles[pageName] });
  }

  function begin() {
    if (!live || savedOptOut() || allowed) return;

    allowed = true;
    window.ccAnalyticsAllowed = true;
    window["ga-disable-" + ID] = false;

    if (loaded) {
      gtag("consent", "update", { analytics_storage: "granted" });
      sendPage();
      return;
    }

    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = gtag;

    gtag("consent", "default", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    });
    gtag("js", new Date());
    gtag("config", ID, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_expires: 2592000,
      page_location: pageUrl(),
      page_referrer: safeReferrer()
    });

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(ID);
    document.head.appendChild(script);
    sendPage();
  }

  function clearCookies() {
    document.cookie.split(";").forEach(pair => {
      const name = pair.trim().split("=")[0];
      if (name !== "_ga" && !/^_ga_[A-Za-z0-9_]+$/.test(name)) return;
      [null, location.hostname, "." + location.hostname, ".currentandcraft.net"].forEach(domain => {
        document.cookie = name + "=; Max-Age=0; path=/; SameSite=Lax" +
          (domain ? "; domain=" + domain : "");
      });
    });
  }

  function updateStatus() {
    const status = document.getElementById("cc-analytics-status");
    if (status) {
      status.textContent = "Website usage analytics: " + (savedOptOut() ? "off" : "on");
    }
  }

  function optOut() {
    store("no");
    allowed = false;
    window.ccAnalyticsAllowed = false;
    window["ga-disable-" + ID] = true;
    if (loaded) {
      gtag("consent", "update", { analytics_storage: "denied" });
    }
    clearCookies();
    updateStatus();
  }

  function choose(value) {
    if (value === "no") {
      optOut();
    } else {
      store("yes");
      begin();
      updateStatus();
    }
  }

  function trackProduct(name, placement, eventName, linkDomain) {
    if (!Object.prototype.hasOwnProperty.call(productCategories, name)) return;
    const params = {
      product_name: name,
      product_category: productCategories[name],
      placement: placement || pageName
    };
    if (linkDomain) params.destination_domain = linkDomain;
    sendEvent(eventName, params);
  }

  function attachClickTracking() {
    document.addEventListener("click", event => {
      const target = event.target instanceof Element ? event.target : null;
      const link = target && target.closest("a[href]");
      if (!link) return;

      const productName = link.dataset.product;
      if (productName && Object.prototype.hasOwnProperty.call(productCategories, productName)) {
        let destination = "";
        try { destination = new URL(link.href).hostname; } catch (_) { /* Ignore invalid URLs. */ }
        trackProduct(productName, link.dataset.placement, "product_launch_click", destination);
        return;
      }
      if (link.closest("nav")) {
        sendEvent("navigation_click", { navigation_target: link.dataset.page || "home" });
      } else if (link.classList.contains("category")) {
        sendEvent("category_click", { target_section: link.dataset.section || "unknown" });
      } else if (link.getAttribute("href") === "index.html#products") {
        sendEvent("cta_click", { cta_name: "explore_products" });
      }
    }, { capture: true });
  }

  function attachImpressionTracking() {
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting || !canTrack()) return;
        const link = entry.target.querySelector("a[data-product]");
        if (!link) return;
        trackProduct(link.dataset.product, link.dataset.placement, "product_impression");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.2 });

    document.querySelectorAll(".flagship, article.product, article.ws-card").forEach(card => {
      if (card.querySelector("a[data-product]")) observer.observe(card);
    });
  }

  function attachScrollTracking() {
    const sent = new Set();
    const milestones = [25, 50, 75, 90];
    function checkScroll() {
      const height = document.documentElement.scrollHeight;
      if (!height || height <= innerHeight) return;
      const percent = 100 * (scrollY + innerHeight) / height;
      milestones.forEach(value => {
        if (percent >= value && !sent.has(value) && canTrack()) {
          sent.add(value);
          sendEvent("scroll_depth", { scroll_milestone: String(value) + "%" });
        }
      });
    }
    window.addEventListener("scroll", checkScroll, { passive: true });
  }

  window.ccTrackPage = name => {
    if (!titles[name] || pageName === name) return;
    pageName = name;
    document.title = titles[name];
    sendPage();
  };

  function initializePage() {
    attachClickTracking();
    attachImpressionTracking();
    attachScrollTracking();

    const accept = document.getElementById("cc-analytics-accept");
    const reject = document.getElementById("cc-analytics-reject");
    if (accept) accept.addEventListener("click", () => choose("yes"));
    if (reject) reject.addEventListener("click", () => choose("no"));
    updateStatus();

    if (document.body) window.ccTrackPage(document.body.dataset.page);
  }

  // Keep the existing default-on / opt-out policy; regional prior-consent
  // requirements must be handled separately if the site is offered there.
  if (live && !savedOptOut()) begin();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializePage, { once: true });
  } else {
    initializePage();
  }
})();
