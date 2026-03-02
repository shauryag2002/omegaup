declare module '*.vue' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, Record<string, unknown>>;
  export default component;
}
