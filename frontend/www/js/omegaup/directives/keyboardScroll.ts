/**
 * Keyboard Scroll Directive
 *
 * A Vue directive that automatically scrolls input elements into view
 * when the mobile keyboard appears.
 *
 * Usage:
 * 1. Register globally in main entry file:
 *    ```typescript
 *    import { keyboardScrollDirective } from '@/directives/keyboardScroll';
 *    Vue.directive('keyboard-scroll', keyboardScrollDirective);
 *    ```
 *
 * 2. Use in templates:
 *    ```html
 *    <input v-keyboard-scroll />
 *    <textarea v-keyboard-scroll />
 *    ```
 *
 * Options:
 *    ```html
 *    <input v-keyboard-scroll="{ delay: 400, offset: 50 }" />
 *    ```
 */

import { DirectiveOptions, VNode } from 'vue';

interface KeyboardScrollOptions {
  /** Delay in ms before scrolling (default: 300) */
  delay?: number;
  /** Additional offset from top in pixels (default: 20) */
  offset?: number;
  /** Scroll behavior: 'smooth' or 'auto' (default: 'smooth') */
  behavior?: ScrollBehavior;
}

const DEFAULT_OPTIONS: Required<KeyboardScrollOptions> = {
  delay: 300,
  offset: 20,
  behavior: 'smooth',
};

/**
 * Check if the device is likely a mobile device with virtual keyboard.
 */
function isMobileDevice(): boolean {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    )
  );
}

/**
 * Scroll element into the visible area of the viewport.
 */
function scrollElementIntoView(
  element: HTMLElement,
  options: Required<KeyboardScrollOptions>,
): void {
  const { offset, behavior } = options;

  // First, use native scrollIntoView
  try {
    element.scrollIntoView({
      behavior,
      block: 'center',
      inline: 'nearest',
    });
  } catch {
    element.scrollIntoView(false);
  }

  // Additional adjustment using Visual Viewport API
  if (window.visualViewport) {
    requestAnimationFrame(() => {
      const rect = element.getBoundingClientRect();
      const viewportHeight = window.visualViewport!.height;
      const viewportTop = window.visualViewport!.offsetTop;

      // Check if element is below visible viewport
      if (rect.bottom > viewportHeight + viewportTop - offset) {
        const scrollAmount =
          rect.bottom - viewportHeight - viewportTop + offset;
        window.scrollBy({
          top: scrollAmount,
          behavior,
        });
      }

      // Check if element is above visible viewport
      if (rect.top < viewportTop + offset) {
        const scrollAmount = rect.top - viewportTop - offset;
        window.scrollBy({
          top: scrollAmount,
          behavior,
        });
      }
    });
  }
}

/**
 * Create focus handler for an element.
 */
function createFocusHandler(
  el: HTMLElement,
  options: Required<KeyboardScrollOptions>,
): () => void {
  return function handleFocus(): void {
    if (!isMobileDevice()) return;

    // Wait for keyboard to appear
    setTimeout(() => {
      scrollElementIntoView(el, options);
    }, options.delay);
  };
}

// Store for cleanup handlers
const elementHandlers = new WeakMap<HTMLElement, () => void>();

/**
 * Vue directive for keyboard scroll behavior.
 */
export const keyboardScrollDirective: DirectiveOptions = {
  bind(
    el: HTMLElement,
    binding: { value?: KeyboardScrollOptions },
    _vnode: VNode,
  ): void {
    const options: Required<KeyboardScrollOptions> = {
      ...DEFAULT_OPTIONS,
      ...binding.value,
    };

    const handler = createFocusHandler(el, options);
    elementHandlers.set(el, handler);

    el.addEventListener('focus', handler);
  },

  update(
    el: HTMLElement,
    binding: {
      value?: KeyboardScrollOptions;
      oldValue?: KeyboardScrollOptions;
    },
  ): void {
    // Remove old handler if options changed
    if (binding.value !== binding.oldValue) {
      const oldHandler = elementHandlers.get(el);
      if (oldHandler) {
        el.removeEventListener('focus', oldHandler);
      }

      const options: Required<KeyboardScrollOptions> = {
        ...DEFAULT_OPTIONS,
        ...binding.value,
      };

      const handler = createFocusHandler(el, options);
      elementHandlers.set(el, handler);
      el.addEventListener('focus', handler);
    }
  },

  unbind(el: HTMLElement): void {
    const handler = elementHandlers.get(el);
    if (handler) {
      el.removeEventListener('focus', handler);
      elementHandlers.delete(el);
    }
  },
};

export default keyboardScrollDirective;
