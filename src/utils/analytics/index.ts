/**
 * DevTales Analytics API
 * Simple, clean API for tracking analytics events
 */

import { getAnalyticsManager } from "./manager";
import type { AnalyticsEventData, StandardEvents } from "./types";

// Initialize analytics with configuration
export async function initializeAnalytics() {
  const manager = getAnalyticsManager();

  await manager.initialize({
    providers: [
      {
        provider: "goatcounter",
        trackingId: "https://leocamachocr.goatcounter.com/count",
        debug: process.env.NODE_ENV === "development",
        enableAutoTracking: true,
      },
    ],
    enableBatching: false, // Disable batching for real-time tracking
  });
}

// Track page views
export function trackPageView(
  url: string,
  title: string,
  contentType?: string
) {
  const manager = getAnalyticsManager();
  manager.trackPageView(url, title, { content_type: contentType });
}

// Track content clicks (tales, posts)
export function trackContentClick(contentType: string, contentTitle: string) {
  const manager = getAnalyticsManager();
  manager.track("content_click", {
    content_type: contentType,
    content_title: contentTitle,
    event_category: "engagement",
  });
}

// Track tag clicks
export function trackTagClick(tagName: string, clickSource: string) {
  const manager = getAnalyticsManager();
  manager.track("tag_click", {
    tag_name: tagName,
    click_source: clickSource,
    event_category: "navigation",
  });
}

// Track search interactions
export function trackSearch(searchTerm: string, resultsCount: number) {
  const manager = getAnalyticsManager();
  manager.track("search", {
    search_term: searchTerm,
    results_count: resultsCount,
    event_category: "engagement",
  });
}

// Track external link clicks
export function trackExternalLink(linkUrl: string, linkText: string) {
  const manager = getAnalyticsManager();
  const linkDomain = new URL(linkUrl).hostname;

  manager.track("external_link_click", {
    link_url: linkUrl,
    link_text: linkText.substring(0, 100), // Limit length
    link_domain: linkDomain,
    event_category: "outbound",
  });
}

// Track mobile menu interactions
export function trackMobileMenu(action: "open" | "close") {
  const manager = getAnalyticsManager();
  manager.track("mobile_menu", {
    menu_action: action,
    event_category: "ui_interaction",
  });
}

// Track scroll depth
export function trackScrollDepth(percentage: number, contentType: string) {
  const manager = getAnalyticsManager();
  manager.track("scroll_depth", {
    scroll_percentage: percentage,
    content_type: contentType,
    event_category: "engagement",
  });
}

// Track reading time
export function trackReadingTime(
  timeSpentSeconds: number,
  contentType: string,
  pageTitle: string
) {
  const manager = getAnalyticsManager();
  manager.track("reading_time", {
    time_spent_seconds: timeSpentSeconds,
    content_type: contentType,
    page_title: pageTitle,
    event_category: "engagement",
  });
}

// Track long engagement sessions
export function trackLongEngagement(
  timeSpentSeconds: number,
  contentType: string
) {
  const manager = getAnalyticsManager();
  manager.track("long_engagement", {
    time_spent_seconds: timeSpentSeconds,
    content_type: contentType,
    event_category: "engagement",
  });
}

// Track page performance
export function trackPagePerformance(
  loadTime: number,
  domContentLoaded: number
) {
  const manager = getAnalyticsManager();
  manager.track("page_performance", {
    load_time: loadTime,
    dom_content_loaded: domContentLoaded,
    event_category: "performance",
  });
}

// Track custom events
export function trackCustomEvent(eventName: string, data: AnalyticsEventData) {
  const manager = getAnalyticsManager();
  manager.trackCustom(eventName, {
    ...data,
    event_category: data.event_category || "custom",
  });
}

// Enable/disable analytics
export function setAnalyticsEnabled(enabled: boolean) {
  const manager = getAnalyticsManager();
  manager.setEnabled(enabled);
}

// Get content type from URL (helper function)
export function getContentTypeFromURL(): string {
  if (typeof window === "undefined") return "unknown";

  const path = window.location.pathname;
  if (path.includes("/tales/")) return "tale";
  if (path.includes("/posts/")) return "post";
  if (path.includes("/tags/")) return "tag_page";
  if (path === "/devtales/" || path === "/devtales/index.html")
    return "homepage";
  if (path.includes("/about")) return "about";
  return "other";
}
