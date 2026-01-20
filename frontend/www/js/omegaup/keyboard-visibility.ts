/**
 * Keyboard Visibility Module
 *
 * This module provides comprehensive solutions for handling mobile keyboard
 * visibility issues where the virtual keyboard can hide input fields.
 *
 * Available exports:
 * - KeyboardVisibilityPlugin: Vue plugin for global automatic handling
 * - KeyboardVisibilityMixin: Vue mixin for component-level handling
 * - keyboardScrollDirective: Vue directive for per-element handling
 *
 * @module keyboard-visibility
 */

// Vue Plugin - Recommended for most use cases
// Automatically handles all inputs globally without any component changes
export {
  default as KeyboardVisibilityPlugin,
  isMobileDevice,
  scrollElementIntoView,
} from './plugins/KeyboardVisibilityPlugin';

// Vue Mixin - For component-specific control
// Use when you need more control or component-specific behavior
export { default as KeyboardVisibilityMixin } from './mixins/KeyboardVisibility';

// Vue Directive - For per-element control
// Use when you want to opt-in specific elements
export { keyboardScrollDirective } from './directives/keyboardScroll';

/**
 * Quick Start Guide:
 *
 * OPTION 1: Global Plugin (Recommended - Zero configuration)
 * =========================================================
 * Install once, works everywhere automatically.
 *
 * In your main entry file (e.g., main.ts or omegaup.ts):
 * ```typescript
 * import Vue from 'vue';
 * import { KeyboardVisibilityPlugin } from '@/keyboard-visibility';
 *
 * Vue.use(KeyboardVisibilityPlugin);
 * // That's it! All inputs are now handled automatically.
 * ```
 *
 * With custom options:
 * ```typescript
 * Vue.use(KeyboardVisibilityPlugin, {
 *   scrollDelay: 400,      // Delay before scrolling (ms)
 *   scrollOffset: 30,      // Padding from viewport edge (px)
 *   scrollBehavior: 'smooth', // 'smooth' or 'auto'
 *   debug: true,           // Enable console logging
 * });
 * ```
 *
 * Manual control in components:
 * ```typescript
 * // Manually scroll an element
 * this.$keyboardVisibility.scrollIntoView('#my-input');
 *
 * // Check if keyboard is visible
 * if (this.$keyboardVisibility.isKeyboardVisible()) {
 *   // Do something
 * }
 *
 * // Temporarily disable
 * this.$keyboardVisibility.disable();
 * this.$keyboardVisibility.enable();
 * ```
 *
 *
 * OPTION 2: Component Mixin (Per-component control)
 * =================================================
 * For components that need specific keyboard handling behavior.
 *
 * ```typescript
 * import { KeyboardVisibilityMixin } from '@/keyboard-visibility';
 *
 * @Component({
 *   mixins: [KeyboardVisibilityMixin],
 * })
 * export default class MyFormComponent extends Vue {
 *   // The mixin automatically handles inputs within this component
 *
 *   // You can also manually scroll elements:
 *   someMethod() {
 *     this.ensureInputVisible('#special-input');
 *   }
 * }
 * ```
 *
 *
 * OPTION 3: Directive (Per-element opt-in)
 * ========================================
 * For selective application to specific inputs.
 *
 * Register globally:
 * ```typescript
 * import Vue from 'vue';
 * import { keyboardScrollDirective } from '@/keyboard-visibility';
 *
 * Vue.directive('keyboard-scroll', keyboardScrollDirective);
 * ```
 *
 * Use in templates:
 * ```html
 * <input v-keyboard-scroll />
 * <textarea v-keyboard-scroll="{ delay: 500 }" />
 * ```
 *
 *
 * CSS Companion
 * =============
 * Don't forget to import the SCSS file for additional mobile optimizations:
 *
 * ```scss
 * @import '@/sass/mobile-keyboard';
 * ```
 *
 * Or import directly in a component:
 * ```vue
 * <style lang="scss">
 * @import '@/sass/mobile-keyboard';
 * </style>
 * ```
 */
