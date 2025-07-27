/**
 * Generic Analytics System - DevTales
 * Abstract interfaces and types for analytics providers
 */

// Core analytics event data structure
export interface AnalyticsEventData {
  [key: string]: string | number | boolean | undefined;
}

// Standard event types that all providers should support
export interface StandardEvents {
  page_view: {
    page_title: string;
    page_location: string;
    content_type?: string;
  };

  content_click: {
    content_type: string;
    content_title: string;
    event_category?: string;
  };

  tag_click: {
    tag_name: string;
    click_source: string;
    event_category?: string;
  };

  search: {
    search_term: string;
    results_count: number;
    event_category?: string;
  };

  external_link_click: {
    link_url: string;
    link_text: string;
    link_domain: string;
    event_category?: string;
  };

  mobile_menu: {
    menu_action: "open" | "close";
    event_category?: string;
  };

  scroll_depth: {
    scroll_percentage: number;
    content_type: string;
    event_category?: string;
  };

  reading_time: {
    time_spent_seconds: number;
    content_type: string;
    page_title: string;
    event_category?: string;
  };

  long_engagement: {
    time_spent_seconds: number;
    content_type: string;
    event_category?: string;
  };

  page_performance: {
    load_time: number;
    dom_content_loaded: number;
    event_category?: string;
  };
}

// Analytics provider configuration
export interface AnalyticsConfig {
  provider: "goatcounter" | "plausible" | "mixpanel" | "custom";
  trackingId: string;
  debug?: boolean;
  enableAutoTracking?: boolean;
  customDomain?: string;
  additionalConfig?: Record<string, any>;
}

// Main analytics provider interface
export interface IAnalyticsProvider {
  // Initialize the provider
  initialize(config: AnalyticsConfig): Promise<void>;

  // Check if provider is ready
  isReady(): boolean;

  // Track standard events
  trackEvent<K extends keyof StandardEvents>(
    eventName: K,
    data: StandardEvents[K]
  ): void;

  // Track custom events
  trackCustomEvent(eventName: string, data: AnalyticsEventData): void;

  // Page tracking
  trackPageView(
    url: string,
    title: string,
    additionalData?: AnalyticsEventData
  ): void;

  // User identification (optional)
  identifyUser?(userId: string, traits?: AnalyticsEventData): void;

  // Set user properties (optional)
  setUserProperties?(properties: AnalyticsEventData): void;

  // Enable/disable tracking
  setTrackingEnabled(enabled: boolean): void;

  // Clean up resources
  destroy?(): void;
}

// Analytics manager configuration
export interface AnalyticsManagerConfig {
  providers: AnalyticsConfig[];
  defaultProvider?: string;
  enableBatching?: boolean;
  batchSize?: number;
  flushInterval?: number;
}

// Event queue item for batching
export interface QueuedEvent {
  provider?: string;
  eventName: string;
  data: AnalyticsEventData;
  timestamp: number;
}

// Analytics manager interface
export interface IAnalyticsManager {
  initialize(config: AnalyticsManagerConfig): Promise<void>;
  track<K extends keyof StandardEvents>(
    eventName: K,
    data: StandardEvents[K]
  ): void;
  trackCustom(eventName: string, data: AnalyticsEventData): void;
  trackPageView(
    url: string,
    title: string,
    additionalData?: AnalyticsEventData
  ): void;
  addProvider(config: AnalyticsConfig): Promise<void>;
  removeProvider(providerId: string): void;
  setEnabled(enabled: boolean): void;
  flush(): void;
}
