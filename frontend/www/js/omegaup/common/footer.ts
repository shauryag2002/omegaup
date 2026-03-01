import omegaup_Footer from '../components/common/Footer.vue';
import { OmegaUp } from '../omegaup';
import { types } from '../api_types';
import { createApp, h } from 'vue';

OmegaUp.on('ready', () => {
  const payload = types.payloadParsers.CommonPayload();

  const commonFooterExists = document.getElementById('common-footer');
  if (!commonFooterExists) {
    return;
  }
  createApp({
    render: () =>
      h(omegaup_Footer, {
        isLoggedIn: (payload && payload.isLoggedIn) || false,
        omegaUpLockDown: (payload && payload.omegaUpLockDown) || false,
      }),
  }).mount('#common-footer');
});
