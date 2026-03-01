import omegaup_ScrollToTop from '../components/common/ScrollToTop.vue';
import { OmegaUp } from '../omegaup';
import { createApp, h } from 'vue';

OmegaUp.on('ready', () => {
  const scrollToTopExists = document.getElementById('scroll-to-top');
  if (!scrollToTopExists) {
    return;
  }
  createApp({
    render: () => h(omegaup_ScrollToTop),
  }).mount('#scroll-to-top');
});
