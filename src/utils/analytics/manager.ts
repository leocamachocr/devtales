/**
 * Analytics Manager - DevTales
 * Central manager for all analytics providers
 */

import type {
  IAnalyticsManager,
  IAnalyticsProvider,
  AnalyticsManagerConfig,
  AnalyticsConfig,
  AnalyticsEventData,
  StandardEvents,
  QueuedEvent,
} from "./types";
import { GoatCounterProvider } from "./providers/goatCounter";

export class AnalyticsManager implements IAnalyticsManager {
  private providers: Map<string, IAnalyticsProvider> = new Map();
  private config: AnalyticsManagerConfig | null = null;
  private isEnabled = true;
  private eventQueue: QueuedEvent[] = [];
  private flushTimer?: number;

  async initialize(config: AnalyticsManagerConfig): Promise<void> {
    this.config = config;

    // Initialize all providers
    for (const providerConfig of config.providers) {
      await this.addProvider(providerConfig);
    }

    // Set up batching if enabled
    if (config.enableBatching && config.flushInterval) {
      this.setupBatching();
    }

    console.log(
      "Analytics Manager initialized with providers:",
      Array.from(this.providers.keys())
    );
  }

  async addProvider(config: AnalyticsConfig): Promise<void> {
    try {
      const provider = this.createProvider(config);
      await provider.initialize(config);

      const providerId = `${config.provider}_${config.trackingId}`;
      this.providers.set(providerId, provider);

      console.log(`Analytics provider added: ${providerId}`);
    } catch (error) {
      console.error(`Failed to add provider ${config.provider}:`, error);
    }
  }

  removeProvider(providerId: string): void {
    const provider = this.providers.get(providerId);
    if (provider && provider.destroy) {
      provider.destroy();
    }
    this.providers.delete(providerId);
    console.log(`Analytics provider removed: ${providerId}`);
  }

  track<K extends keyof StandardEvents>(
    eventName: K,
    data: StandardEvents[K]
  ): void {
    if (!this.isEnabled) return;

    if (this.config?.enableBatching) {
      this.queueEvent(eventName, data);
    } else {
      this.executeTrackEvent(eventName, data);
    }
  }

  trackCustom(eventName: string, data: AnalyticsEventData): void {
    if (!this.isEnabled) return;

    if (this.config?.enableBatching) {
      this.queueEvent(eventName, data);
    } else {
      this.executeCustomEvent(eventName, data);
    }
  }

  trackPageView(
    url: string,
    title: string,
    additionalData?: AnalyticsEventData
  ): void {
    if (!this.isEnabled) return;

    this.providers.forEach((provider) => {
      if (provider.isReady()) {
        provider.trackPageView(url, title, additionalData);
      }
    });
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    this.providers.forEach((provider) => {
      provider.setTrackingEnabled(enabled);
    });
  }

  flush(): void {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    events.forEach((event) => {
      if (this.isStandardEvent(event.eventName)) {
        // For standard events, we need to cast the data appropriately
        this.executeTrackEvent(
          event.eventName as keyof StandardEvents,
          event.data as any
        );
      } else {
        this.executeCustomEvent(event.eventName, event.data);
      }
    });
  }

  private createProvider(config: AnalyticsConfig): IAnalyticsProvider {
    switch (config.provider) {
      case "goatcounter":
        return new GoatCounterProvider();

      case "plausible":
        // Future implementation
        throw new Error("Plausible provider not implemented yet");

      case "mixpanel":
        // Future implementation
        throw new Error("Mixpanel provider not implemented yet");

      case "custom":
        // Future implementation for custom providers
        throw new Error("Custom provider not implemented yet");

      default:
        throw new Error(`Unknown analytics provider: ${config.provider}`);
    }
  }

  private executeTrackEvent<K extends keyof StandardEvents>(
    eventName: K,
    data: StandardEvents[K]
  ): void {
    this.providers.forEach((provider) => {
      if (provider.isReady()) {
        provider.trackEvent(eventName, data);
      }
    });
  }

  private executeCustomEvent(
    eventName: string,
    data: AnalyticsEventData
  ): void {
    this.providers.forEach((provider) => {
      if (provider.isReady()) {
        provider.trackCustomEvent(eventName, data);
      }
    });
  }

  private queueEvent(eventName: string, data: AnalyticsEventData): void {
    this.eventQueue.push({
      eventName,
      data,
      timestamp: Date.now(),
    });

    // Auto-flush if queue is full
    if (
      this.config?.batchSize &&
      this.eventQueue.length >= this.config.batchSize
    ) {
      this.flush();
    }
  }

  private setupBatching(): void {
    if (!this.config?.flushInterval) return;

    this.flushTimer = window.setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  private isStandardEvent(
    eventName: string
  ): eventName is keyof StandardEvents {
    const standardEvents = [
      "page_view",
      "content_click",
      "tag_click",
      "search",
      "external_link_click",
      "mobile_menu",
      "scroll_depth",
      "reading_time",
      "long_engagement",
      "page_performance",
    ];
    return standardEvents.includes(eventName);
  }

  // Clean up resources
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flush(); // Flush remaining events

    this.providers.forEach((provider) => {
      if (provider.destroy) {
        provider.destroy();
      }
    });

    this.providers.clear();
    this.eventQueue = [];
    this.isEnabled = false;
  }
}

// Singleton instance
let analyticsManager: AnalyticsManager | null = null;

export function getAnalyticsManager(): AnalyticsManager {
  if (!analyticsManager) {
    analyticsManager = new AnalyticsManager();
  }
  return analyticsManager;
}
