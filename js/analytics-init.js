/**
 * Analytics Initialization - Client Side
 * Initializes the analytics system and sets up auto-tracking
 * Now using GoatCounter instead of Google Analytics
 */

class DevTalesAnalytics {
  constructor() {
    this.isInitialized = false;
    this.trackingEnabled = true;
    this.readingStartTime = null;
    this.scrollPercentages = [25, 50, 75, 90];
    this.scrollTracked = new Set();
  }

  async initialize() {
    try {
      // Load GoatCounter
      await this.loadGoatCounter();

      // Set up automatic tracking
      this.setupAutoTracking();

      // Track initial page view
      this.trackPageView();

      this.isInitialized = true;
      console.log("DevTales Analytics (GoatCounter) initialized successfully");
    } catch (error) {
      console.error("Failed to initialize analytics:", error);
    }
  }

  async loadGoatCounter() {
    // Load GoatCounter script
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.async = true;
      script.src = "//gc.zgo.at/count.js";
      script.setAttribute(
        "data-goatcounter",
        "https://leocamachocr.goatcounter.com/count"
      );

      script.onload = () => {
        // GoatCounter automatically initializes itself
        resolve();
      };

      script.onerror = () => reject(new Error("Failed to load GoatCounter"));
      document.head.appendChild(script);
    });
  }

  setupAutoTracking() {
    this.setupScrollTracking();
    this.setupReadingTimeTracking();
    this.setupExternalLinkTracking();
    this.setupPerformanceTracking();
  }

  // Public API methods
  trackPageView() {
    if (!this.isReady()) return;

    const contentType = this.getContentTypeFromURL();
    // GoatCounter automatically tracks page views, but we can send custom data
    this.trackGoatCounterEvent("page_view", {
      content_type: contentType,
      page_title: document.title,
    });
  }

  trackContentClick(contentType, contentTitle) {
    if (!this.isReady()) return;

    this.trackGoatCounterEvent("content_click", {
      content_type: contentType,
      content_title: contentTitle,
      category: "engagement",
    });
  }

  trackTagClick(tagName, clickSource) {
    if (!this.isReady()) return;

    this.trackGoatCounterEvent("tag_click", {
      tag_name: tagName,
      click_source: clickSource,
      category: "navigation",
    });
  }

  trackMobileMenu(action) {
    if (!this.isReady()) return;

    this.trackGoatCounterEvent("mobile_menu", {
      menu_action: action,
      category: "ui_interaction",
    });
  }

  trackCustomEvent(eventName, data) {
    if (!this.isReady()) return;

    this.trackGoatCounterEvent(eventName, {
      ...data,
      category: data.category || "custom",
    });
  }

  // GoatCounter event tracking helper
  trackGoatCounterEvent(eventName, data) {
    if (!window.goatcounter) return;

    // Convert data to URL parameters
    const params = new URLSearchParams();
    params.set("event", eventName);

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.set(key, String(value));
      }
    });

    // Send to GoatCounter
    window.goatcounter.count({
      path: `${window.location.pathname}?${params.toString()}`,
      title: document.title,
      event: true,
    });
  }

  // Helper methods
  isReady() {
    return (
      this.isInitialized &&
      this.trackingEnabled &&
      typeof window.goatcounter === "object" &&
      window.goatcounter
    );
  }

  getContentTypeFromURL() {
    const path = window.location.pathname;
    if (path.includes("/tales/")) return "tale";
    if (path.includes("/posts/")) return "post";
    if (path.includes("/tags/")) return "tag_page";
    if (path === "/devtales/" || path === "/devtales/index.html")
      return "homepage";
    if (path.includes("/about")) return "about";
    return "other";
  }

  setupScrollTracking() {
    let ticking = false;

    const trackScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY /
          (document.documentElement.scrollHeight - window.innerHeight)) *
          100
      );

      this.scrollPercentages.forEach((percentage) => {
        if (
          scrollPercent >= percentage &&
          !this.scrollTracked.has(percentage)
        ) {
          this.scrollTracked.add(percentage);

          if (this.isReady()) {
            this.trackGoatCounterEvent("scroll_depth", {
              scroll_percentage: percentage,
              content_type: this.getContentTypeFromURL(),
              category: "engagement",
            });
          }
        }
      });

      ticking = false;
    };

    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(trackScroll);
        ticking = true;
      }
    });
  }

  setupReadingTimeTracking() {
    this.readingStartTime = Date.now();

    window.addEventListener("beforeunload", () => {
      if (this.readingStartTime) {
        const timeSpent = Math.round(
          (Date.now() - this.readingStartTime) / 1000
        );

        if (timeSpent >= 10 && this.isReady()) {
          this.trackGoatCounterEvent("reading_time", {
            time_spent_seconds: timeSpent,
            content_type: this.getContentTypeFromURL(),
            page_title: document.title,
            category: "engagement",
          });
        }
      }
    });

    // Track long engagement
    setInterval(() => {
      if (this.readingStartTime && document.visibilityState === "visible") {
        const timeSpent = Math.round(
          (Date.now() - this.readingStartTime) / 1000
        );

        if ([120, 300, 600].includes(timeSpent) && this.isReady()) {
          this.trackGoatCounterEvent("long_engagement", {
            time_spent_seconds: timeSpent,
            content_type: this.getContentTypeFromURL(),
            category: "engagement",
          });
        }
      }
    }, 30000);
  }

  setupExternalLinkTracking() {
    document.addEventListener("click", (e) => {
      const link = e.target.closest("a");
      if (!link) return;

      const href = link.getAttribute("href");
      if (!href) return;

      if (href.startsWith("http") && !href.includes(window.location.hostname)) {
        if (this.isReady()) {
          this.trackGoatCounterEvent("external_link_click", {
            link_url: href,
            link_text: link.textContent.trim().substring(0, 100),
            link_domain: new URL(href).hostname,
            category: "outbound",
          });
        }
      }
    });
  }

  setupPerformanceTracking() {
    window.addEventListener("load", () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType("navigation")[0];
        if (navigation && this.isReady()) {
          this.trackGoatCounterEvent("page_performance", {
            load_time: Math.round(
              navigation.loadEventEnd - navigation.fetchStart
            ),
            dom_content_loaded: Math.round(
              navigation.domContentLoadedEventEnd - navigation.fetchStart
            ),
            category: "performance",
          });
        }
      }, 1000);
    });
  }
}

// Initialize analytics
export async function initializeAnalytics() {
  if (typeof window !== "undefined") {
    window.devTalesAnalytics = new DevTalesAnalytics();
    await window.devTalesAnalytics.initialize();
  }
}

// Auto-initialize if script is loaded directly
if (typeof window !== "undefined") {
  initializeAnalytics();
}
