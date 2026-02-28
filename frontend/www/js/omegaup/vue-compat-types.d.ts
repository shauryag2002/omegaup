/**
 * Type declaration shim for @vue/compat.
 *
 * @vue/compat does not wire up its own TypeScript declarations in package.json.
 * This shim re-exports everything from @vue/runtime-dom (the standard Vue 3
 * type root) and adds the CompatVue default export and configureCompat function
 * that are present in the @vue/compat ESM bundle but missing from the package
 * type declarations.
 */
declare module '@vue/compat' {
  import { CompatVue } from '@vue/runtime-core';
  export * from '@vue/runtime-dom';
  /**
   * Configures Vue 2/3 compatibility behaviour for the migration build.
   * @see https://v3-migration.vuejs.org/migration-build.html
   */
  export declare function configureCompat(
    config: Partial<Record<string, boolean | 'suppress-warning'>> & {
      MODE?: 2 | 3 | ((comp: unknown) => 2 | 3);
    },
  ): void;
  const Vue: CompatVue;
  export { Vue as default };
}
