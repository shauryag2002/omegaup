import { createApp, h } from 'vue';
import certificate_Details from '../components/certificate/Details.vue';
import { OmegaUp } from '../omegaup';
import { types } from '../api_types';

OmegaUp.on('ready', () => {
  const payload = types.payloadParsers.CertificateDetailsPayload();
  createApp({
    render: () =>
      h(certificate_Details, {
        uuid: payload.uuid,
      }),
  }).mount('#main-container');
});
