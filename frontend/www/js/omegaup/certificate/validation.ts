import { createApp, h } from 'vue';
import certificate_Validation from '../components/certificate/Validation.vue';
import { OmegaUp } from '../omegaup';
import { types } from '../api_types';

OmegaUp.on('ready', () => {
  const payload = types.payloadParsers.CertificateValidationPayload();
  createApp({
    render: () =>
      h(certificate_Validation, {
        verificationCode: payload.verification_code,
        isValid: payload.valid,
        certificate: payload.certificate,
      }),
  }).mount('#main-container');
});
