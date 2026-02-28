/**
 * Vue 3 Compatibility Layer
 *
 * This module configures Vue 3 to run in Vue 2 compatibility mode using
 * @vue/compat. It is aliased as 'vue' in the webpack config, so all existing
 * `import Vue from 'vue'` statements automatically use the compat build with
 * MODE: 2 (Vue 2 behavior by default).
 *
 * Individual components can opt into Vue 3 behavior by setting:
 *   compatConfig: { MODE: 3 }
 * in their component options.
 *
 * Once all components have been migrated, this file and the @vue/compat
 * dependency can be removed, and the webpack alias can point directly to 'vue'.
 *
 * @see https://v3-migration.vuejs.org/migration-build.html
 */
import { configureCompat } from '@vue/compat';

configureCompat({
  MODE: 2,
});

export * from '@vue/compat';
export { default } from '@vue/compat';
