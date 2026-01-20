/**
 * KeyboardVisibility Mixin
 *
 * A Vue mixin that handles mobile keyboard visibility issues by automatically
 * scrolling focused input elements into view when the virtual keyboard opens.
 *
 * This mixin uses the Visual Viewport API to detect keyboard appearance and
 * scrolls the focused input element into the visible area.
 *
 * Usage:
 * 1. Import and use as a mixin in any component:
 *    ```typescript
 *    import KeyboardVisibilityMixin from '@/mixins/KeyboardVisibility';
 *
 *    @Component({ mixins: [KeyboardVisibilityMixin] })
 *    export default class MyComponent extends Vue {}
 *    ```
 *
 * 2. Or use the global directive (if registered globally):
 *    ```html
 *    <input v-keyboard-scroll />
 *    ```
 */

import { Vue, Component } from 'vue-property-decorator';

// Input element selectors that should be handled
const INPUT_SELECTORS =
  'input, textarea, [contenteditable="true"], select, .form-control';

// Debounce delay for resize events (ms)
const RESIZE_DEBOUNCE_DELAY = 100;

// Scroll behavior options
const SCROLL_OPTIONS: ScrollIntoViewOptions = {
  behavior: 'smooth',
  block: 'center',
  inline: 'nearest',
};

interface ViewportState {
  initialHeight: number;
  isKeyboardVisible: boolean;
}

/**
 * Mixin to handle keyboard visibility on mobile devices.
 * Automatically scrolls focused input elements into view when keyboard opens.
 */
@Component
export default class KeyboardVisibilityMixin extends Vue {
  private viewportState: ViewportState = {
    initialHeight: 0,
    isKeyboardVisible: false,
  };
  private resizeTimeout: ReturnType<typeof setTimeout> | null = null;
  private boundHandleViewportResize: (() => void) | null = null;
  private boundHandleFocusIn: ((e: FocusEvent) => void) | null = null;

  mounted(): void {
    this.initKeyboardVisibilityHandler();
  }

  beforeDestroy(): void {
    this.cleanupKeyboardVisibilityHandler();
  }

  /**
   * Initialize the keyboard visibility handler.
   * Sets up event listeners for viewport resize and focus events.
   */
  private initKeyboardVisibilityHandler(): void {
    // Store initial viewport height
    this.viewportState.initialHeight = this.getViewportHeight();

    // Bind handlers to preserve context
    this.boundHandleViewportResize = this.handleViewportResize.bind(this);
    this.boundHandleFocusIn = this.handleFocusIn.bind(this);

    // Use Visual Viewport API if available (modern browsers)
    if (window.visualViewport) {
      window.visualViewport.addEventListener(
        'resize',
        this.boundHandleViewportResize,
      );
    } else {
      // Fallback for older browsers
      window.addEventListener('resize', this.boundHandleViewportResize);
    }

    // Listen for focus events on the component's root element
    this.$el?.addEventListener(
      'focusin',
      this.boundHandleFocusIn as EventListener,
    );
  }

  /**
   * Cleanup event listeners when component is destroyed.
   */
  private cleanupKeyboardVisibilityHandler(): void {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    if (this.boundHandleViewportResize) {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener(
          'resize',
          this.boundHandleViewportResize,
        );
      } else {
        window.removeEventListener('resize', this.boundHandleViewportResize);
      }
    }

    if (this.boundHandleFocusIn) {
      this.$el?.removeEventListener(
        'focusin',
        this.boundHandleFocusIn as EventListener,
      );
    }
  }

  /**
   * Get the current viewport height.
   * Uses Visual Viewport API for accuracy on mobile devices.
   */
  private getViewportHeight(): number {
    return window.visualViewport?.height ?? window.innerHeight;
  }

  /**
   * Check if the device is likely a mobile device with virtual keyboard.
   */
  private isMobileDevice(): boolean {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      )
    );
  }

  /**
   * Handle viewport resize events (keyboard open/close).
   */
  private handleViewportResize(): void {
    // Debounce resize events
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    this.resizeTimeout = setTimeout(() => {
      const currentHeight = this.getViewportHeight();
      const heightDifference = this.viewportState.initialHeight - currentHeight;

      // Keyboard is considered visible if viewport height decreased by more than 150px
      const isKeyboardVisible = heightDifference > 150;

      if (isKeyboardVisible !== this.viewportState.isKeyboardVisible) {
        this.viewportState.isKeyboardVisible = isKeyboardVisible;

        if (isKeyboardVisible) {
          this.scrollFocusedElementIntoView();
        }
      }
    }, RESIZE_DEBOUNCE_DELAY);
  }

  /**
   * Handle focus events on input elements.
   */
  private handleFocusIn(event: FocusEvent): void {
    const target = event.target as HTMLElement;

    if (!target || !this.isInputElement(target)) {
      return;
    }

    // On mobile, scroll after a short delay to allow keyboard to open
    if (this.isMobileDevice()) {
      setTimeout(() => {
        this.scrollElementIntoView(target);
      }, 300);
    }
  }

  /**
   * Check if an element is an input-type element.
   */
  private isInputElement(element: HTMLElement): boolean {
    return element.matches(INPUT_SELECTORS);
  }

  /**
   * Scroll the currently focused element into view.
   */
  private scrollFocusedElementIntoView(): void {
    const activeElement = document.activeElement as HTMLElement | null;

    if (activeElement && this.isInputElement(activeElement)) {
      this.scrollElementIntoView(activeElement);
    }
  }

  /**
   * Scroll a specific element into the visible viewport.
   */
  protected scrollElementIntoView(element: HTMLElement): void {
    if (!element) return;

    // Use scrollIntoView with smooth behavior
    try {
      element.scrollIntoView(SCROLL_OPTIONS);
    } catch {
      // Fallback for browsers that don't support options
      element.scrollIntoView(false);
    }

    // Additional adjustment for Visual Viewport
    if (window.visualViewport && this.viewportState.isKeyboardVisible) {
      const rect = element.getBoundingClientRect();
      const viewportHeight = window.visualViewport.height;
      const viewportTop = window.visualViewport.offsetTop;

      // Check if element is still outside visible viewport
      if (rect.bottom > viewportHeight + viewportTop) {
        const scrollAmount = rect.bottom - viewportHeight - viewportTop + 20;
        window.scrollBy({
          top: scrollAmount,
          behavior: 'smooth',
        });
      }
    }
  }

  /**
   * Manually trigger scroll for a specific element.
   * Can be called from component methods if needed.
   */
  public ensureInputVisible(elementOrSelector: HTMLElement | string): void {
    let element: HTMLElement | null = null;

    if (typeof elementOrSelector === 'string') {
      element = this.$el?.querySelector(
        elementOrSelector,
      ) as HTMLElement | null;
    } else {
      element = elementOrSelector;
    }

    if (element) {
      this.scrollElementIntoView(element);
    }
  }
}
