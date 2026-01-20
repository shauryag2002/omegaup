/**
 * Vue Plugins Initialization
 *
 * This file initializes all global Vue plugins used across the application.
 * Import this file in your entry points to ensure all plugins are registered.
 *
 * Usage in entry point files:
 * ```typescript
 * import '@/vue-plugins';
 * // ... rest of your code
 * ```
 */

import Vue from 'vue';
import KeyboardVisibilityPlugin from './plugins/KeyboardVisibilityPlugin';

// Register the Keyboard Visibility Plugin globally
// This automatically handles mobile keyboard visibility issues for all inputs
Vue.use(KeyboardVisibilityPlugin, {
  scrollDelay: 300,
  scrollOffset: 20,
  scrollBehavior: 'smooth',
  // Set to true for debugging during development
  debug: process.env.NODE_ENV === 'development',
});

/**
 * Export Vue for convenience so entry points can import it from here
 * if they're also importing the plugins.
 */
export { Vue };

/**
 * Re-export keyboard visibility utilities for manual usage in components
 */
export { default as KeyboardVisibilityPlugin } from './plugins/KeyboardVisibilityPlugin';
export {
  isMobileDevice,
  scrollElementIntoView,
} from './plugins/KeyboardVisibilityPlugin';

export { default as KeyboardVisibilityMixin } from './mixins/KeyboardVisibility';
export { keyboardScrollDirective } from './directives/keyboardScroll';
