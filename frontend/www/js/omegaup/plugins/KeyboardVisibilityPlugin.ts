/**
 * Keyboard Visibility Plugin
 *
 * A Vue plugin that automatically handles mobile keyboard visibility issues
 * globally across the entire application.
 *
 * This plugin:
 * 1. Automatically scrolls focused inputs into view when keyboard opens
 * 2. Adjusts the viewport to account for virtual keyboard on mobile
 * 3. Works without any changes to existing components
 *
 * Installation:
 * ```typescript
 * import Vue from 'vue';
 * import KeyboardVisibilityPlugin from '@/plugins/KeyboardVisibilityPlugin';
 *
 * Vue.use(KeyboardVisibilityPlugin, {
 *   scrollDelay: 300,
 *   scrollOffset: 20,
 *   scrollBehavior: 'smooth',
 * });
 * ```
 */

import { PluginFunction, VueConstructor } from 'vue';

export interface KeyboardVisibilityPluginOptions {
  /** Delay in ms before scrolling after focus (default: 300) */
  scrollDelay?: number;
  /** Additional offset from top/bottom in pixels (default: 20) */
  scrollOffset?: number;
  /** Scroll behavior: 'smooth' or 'auto' (default: 'smooth') */
  scrollBehavior?: ScrollBehavior;
  /** CSS selector for input elements to handle (default: standard inputs) */
  inputSelector?: string;
  /** Enable/disable the plugin (default: true) */
  enabled?: boolean;
  /** Enable debug logging (default: false) */
  debug?: boolean;
}

interface PluginState {
  initialHeight: number;
  isKeyboardVisible: boolean;
  lastFocusedElement: HTMLElement | null;
  options: Required<KeyboardVisibilityPluginOptions>;
}

const DEFAULT_INPUT_SELECTOR =
  'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([type="reset"]), ' +
  '[contenteditable="true"], ' +
  'select';

const DEFAULT_OPTIONS: Required<KeyboardVisibilityPluginOptions> = {
  scrollDelay: 300,
  scrollOffset: 100, // Keep cursor 100px above keyboard
  scrollBehavior: 'smooth',
  inputSelector: DEFAULT_INPUT_SELECTOR,
  enabled: true,
  debug: false,
};

let isInstalled = false;
let state: PluginState;
let resizeTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Check if the device is likely a mobile device with virtual keyboard.
 */
function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;

  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    )
  );
}

/**
 * Get the current viewport height using Visual Viewport API.
 */
function getViewportHeight(): number {
  return window.visualViewport?.height ?? window.innerHeight;
}

/**
 * Log debug messages if debug mode is enabled.
 */
function debug(...args: unknown[]): void {
  if (state?.options.debug) {
    console.log('[KeyboardVisibility]', ...args);
  }
}

/**
 * Scroll an element into the visible viewport area.
 */
function scrollElementIntoView(element: HTMLElement): void {
  if (!element || !state.options.enabled) return;

  const { scrollOffset, scrollBehavior } = state.options;

  debug('Scrolling element into view:', element);

  // Use native scrollIntoView first
  try {
    element.scrollIntoView({
      behavior: scrollBehavior,
      block: 'center',
      inline: 'nearest',
    });
  } catch {
    element.scrollIntoView(false);
  }

  // Additional adjustment for Visual Viewport
  if (window.visualViewport) {
    requestAnimationFrame(() => {
      const rect = element.getBoundingClientRect();
      const viewportHeight = window.visualViewport!.height;
      const viewportTop = window.visualViewport!.offsetTop;

      debug('Element rect:', rect);
      debug('Viewport:', { height: viewportHeight, top: viewportTop });

      // Check if element is below visible viewport
      if (rect.bottom > viewportHeight + viewportTop - scrollOffset) {
        const scrollAmount =
          rect.bottom - viewportHeight - viewportTop + scrollOffset;
        debug('Scrolling down by:', scrollAmount);
        window.scrollBy({
          top: scrollAmount,
          behavior: scrollBehavior,
        });
      }

      // Check if element is above visible viewport
      if (rect.top < viewportTop + scrollOffset) {
        const scrollAmount = rect.top - viewportTop - scrollOffset;
        debug('Scrolling up by:', scrollAmount);
        window.scrollBy({
          top: scrollAmount,
          behavior: scrollBehavior,
        });
      }
    });
  }
}

/**
 * Handle viewport resize events (keyboard appearing/disappearing).
 */
function handleViewportResize(): void {
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
  }

  resizeTimeout = setTimeout(() => {
    const currentHeight = getViewportHeight();
    const heightDifference = state.initialHeight - currentHeight;

    // Consider keyboard visible if viewport shrunk by more than 150px
    const wasKeyboardVisible = state.isKeyboardVisible;
    state.isKeyboardVisible = heightDifference > 150;

    debug('Viewport resize:', {
      initial: state.initialHeight,
      current: currentHeight,
      difference: heightDifference,
      keyboardVisible: state.isKeyboardVisible,
    });

    // Keyboard just appeared
    if (state.isKeyboardVisible && !wasKeyboardVisible) {
      if (state.lastFocusedElement) {
        scrollElementIntoView(state.lastFocusedElement);
      }
    }
  }, 100);
}

/**
 * Handle focus events on input elements.
 */
function handleFocusIn(event: FocusEvent): void {
  if (!state.options.enabled) return;

  const target = event.target as HTMLElement;
  if (!target || !target.matches(state.options.inputSelector)) {
    return;
  }

  debug('Focus on input:', target);
  state.lastFocusedElement = target;

  // On mobile, scroll after keyboard opens
  if (isMobileDevice()) {
    setTimeout(() => {
      scrollElementIntoView(target);
    }, state.options.scrollDelay);
  }
}

/**
 * Handle blur events to clear the last focused element.
 */
function handleFocusOut(): void {
  // Small delay to allow for focus transfer between inputs
  setTimeout(() => {
    const activeElement = document.activeElement as HTMLElement;
    if (!activeElement?.matches(state.options.inputSelector)) {
      state.lastFocusedElement = null;
    }
  }, 100);
}

/**
 * Initialize the keyboard visibility handling.
 */
function initialize(options: KeyboardVisibilityPluginOptions): void {
  state = {
    initialHeight: getViewportHeight(),
    isKeyboardVisible: false,
    lastFocusedElement: null,
    options: { ...DEFAULT_OPTIONS, ...options },
  };

  debug('Initializing with options:', state.options);

  // Listen for viewport resize (keyboard appearance)
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', handleViewportResize);
    debug('Using Visual Viewport API');
  } else {
    window.addEventListener('resize', handleViewportResize);
    debug('Using window resize fallback');
  }

  // Listen for focus events globally
  document.addEventListener('focusin', handleFocusIn as EventListener);
  document.addEventListener('focusout', handleFocusOut as EventListener);

  // Handle orientation changes
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      state.initialHeight = getViewportHeight();
      debug('Orientation changed, new initial height:', state.initialHeight);
    }, 500);
  });

  debug('Keyboard visibility handling initialized');
}

/**
 * Clean up event listeners.
 */
function cleanup(): void {
  if (window.visualViewport) {
    window.visualViewport.removeEventListener('resize', handleViewportResize);
  } else {
    window.removeEventListener('resize', handleViewportResize);
  }

  document.removeEventListener('focusin', handleFocusIn as EventListener);
  document.removeEventListener('focusout', handleFocusOut as EventListener);

  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
  }

  debug('Keyboard visibility handling cleaned up');
}

/**
 * The Vue plugin install function.
 */
const install: PluginFunction<KeyboardVisibilityPluginOptions> = (
  Vue: VueConstructor,
  options?: KeyboardVisibilityPluginOptions,
): void => {
  if (isInstalled) {
    debug('Plugin already installed');
    return;
  }

  isInstalled = true;

  // Initialize when DOM is ready
  if (typeof document !== 'undefined') {
    if (
      document.readyState === 'complete' ||
      document.readyState === 'interactive'
    ) {
      initialize(options || {});
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        initialize(options || {});
      });
    }
  }

  // Expose methods on Vue prototype for manual control
  Vue.prototype.$keyboardVisibility = {
    /**
     * Manually scroll an element into view.
     */
    scrollIntoView(element: HTMLElement | string): void {
      const el =
        typeof element === 'string'
          ? document.querySelector<HTMLElement>(element)
          : element;
      if (el) {
        scrollElementIntoView(el);
      }
    },

    /**
     * Check if the virtual keyboard is currently visible.
     */
    isKeyboardVisible(): boolean {
      return state?.isKeyboardVisible ?? false;
    },

    /**
     * Enable the plugin.
     */
    enable(): void {
      if (state) {
        state.options.enabled = true;
        debug('Plugin enabled');
      }
    },

    /**
     * Disable the plugin.
     */
    disable(): void {
      if (state) {
        state.options.enabled = false;
        debug('Plugin disabled');
      }
    },

    /**
     * Update plugin options at runtime.
     */
    setOptions(newOptions: Partial<KeyboardVisibilityPluginOptions>): void {
      if (state) {
        state.options = { ...state.options, ...newOptions };
        debug('Options updated:', state.options);
      }
    },
  };
};

// Plugin object
const KeyboardVisibilityPlugin = {
  install,
  cleanup,
};

// TypeScript augmentation for Vue prototype
declare module 'vue/types/vue' {
  interface Vue {
    $keyboardVisibility: {
      scrollIntoView(element: HTMLElement | string): void;
      isKeyboardVisible(): boolean;
      enable(): void;
      disable(): void;
      setOptions(options: Partial<KeyboardVisibilityPluginOptions>): void;
    };
  }
}

export default KeyboardVisibilityPlugin;
export { install, cleanup, scrollElementIntoView, isMobileDevice };
