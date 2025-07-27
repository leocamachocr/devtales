/**
 * GoatCounter Analytics Provider Implementation
 * Implements the IAnalyticsProvider interface for GoatCounter
 */

import type {
  IAnalyticsProvider,
  AnalyticsConfig,
  AnalyticsEventData,
  StandardEvents,
} from "../types";

// Extend window interface for GoatCounter
declare global {
  interface Window {
    goatcounter: {
      count: (options?: {
        path?: string;
        title?: string;
        event?: boolean;
        referrer?: string;
      }) => void;
      visit_count: (options: {
        type: string;
        append?: string;
        path?: string;
        title?: string;
      }) => void;
    };
  }
}

export class GoatCounterProvider implements IAnalyticsProvider {
  private config: AnalyticsConfig | null = null;
  private isInitialized = false;
  private trackingEnabled = true;

  async initialize(config: AnalyticsConfig): Promise<void> {
    this.config = config;

    try {
      // Load GoatCounter script
      await this.loadGoatCounterScript();

      this.isInitialized = true;

      if (config.debug) {
        console.log("GoatCounter initialized successfully", config);
      }
    } catch (error) {
      console.error("Failed to initialize GoatCounter:", error);
      throw error;
    }
  }

  private async loadGoatCounterScript(): Promise<void> {
    if (!this.config) throw new Error("Config not set");

    const trackingId = this.config.trackingId;

    return new Promise((resolve, reject) => {
      // Check if script already exists
      const existingScript = document.querySelector(
        `script[data-goatcounter*="${trackingId}"]`
      );

      if (existingScript) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.async = true;
      script.src = "//gc.zgo.at/count.js";
      script.setAttribute("data-goatcounter", trackingId);

      script.onload = () => {
        // Wait a bit for goatcounter to be available
        setTimeout(() => resolve(), 100);
      };
      script.onerror = () =>
        reject(new Error("Failed to load GoatCounter script"));

      document.head.appendChild(script);
    });
  }

  isReady(): boolean {
    return this.isInitialized && typeof window.goatcounter !== "undefined";
  }

  trackEvent<K extends keyof StandardEvents>(
    eventName: K,
    data: StandardEvents[K]
  ): void {
    if (!this.isReady() || !this.trackingEnabled) return;

    try {
      // GoatCounter primarily tracks page views and custom events
      // We'll convert our events to GoatCounter's format
      this.trackGoatCounterEvent(eventName, data);

      if (this.config?.debug) {
        console.log("GoatCounter Event tracked:", eventName, data);
      }
    } catch (error) {
      console.error("Failed to track GoatCounter event:", error);
    }
  }

  trackCustomEvent(eventName: string, data: AnalyticsEventData): void {
    if (!this.isReady() || !this.trackingEnabled) return;

    try {
      this.trackGoatCounterEvent(eventName, data);

      if (this.config?.debug) {
        console.log("GoatCounter Custom event tracked:", eventName, data);
      }
    } catch (error) {
      console.error("Failed to track GoatCounter custom event:", error);
    }
  }

  trackPageView(
    url: string,
    title: string,
    additionalData?: AnalyticsEventData
  ): void {
    if (!this.isReady() || !this.trackingEnabled) return;

    try {
      // GoatCounter's primary function - track page views
      window.goatcounter.count({
        path: url,
        title: title,
      });

      if (this.config?.debug) {
        console.log("GoatCounter Page view tracked:", {
          url,
          title,
          additionalData,
        });
      }
    } catch (error) {
      console.error("Failed to track GoatCounter page view:", error);
    }
  }

  setTrackingEnabled(enabled: boolean): void {
    this.trackingEnabled = enabled;

    if (this.config?.debug) {
      console.log("GoatCounter tracking enabled:", enabled);
    }
  }

  destroy(): void {
    this.isInitialized = false;
    this.trackingEnabled = false;
    this.config = null;

    // Remove GoatCounter script if needed
    const script = document.querySelector('script[src*="gc.zgo.at/count.js"]');
    if (script) {
      script.remove();
    }
  }

  private trackGoatCounterEvent(eventName: string, data: any): void {
    if (!window.goatcounter) return;

    // GoatCounter doesn't have traditional events like GA4
    // We'll track events as special page views with event data in the path
    const eventPath = this.formatEventPath(eventName, data);

    window.goatcounter.count({
      path: eventPath,
      title: `Event: ${eventName}`,
      event: true,
    });
  }

  private formatEventPath(eventName: string, data: any): string {
    // Create a unique path for events that can be tracked in GoatCounter
    const currentPath = window.location.pathname;

    // Format event data into a readable string
    const eventDetails = this.formatEventData(data);

    return `${currentPath}?event=${eventName}&${eventDetails}`;
  }

  private formatEventData(data: any): string {
    // Convert event data to URL parameters for GoatCounter
    const params = new URLSearchParams();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    return params.toString();
  }
}
