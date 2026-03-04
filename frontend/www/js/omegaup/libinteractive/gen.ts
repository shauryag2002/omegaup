import { OmegaUp } from '../omegaup';
import { types } from '../api_types';
import { createApp, h } from 'vue';
import libinteractive_Gen from '../components/libinteractive/Gen.vue';

OmegaUp.on('ready', () => {
  const payload = types.payloadParsers.LibinteractiveGenPayload();
  createApp({
    render: () =>
      h(libinteractive_Gen as any, {
        error: payload.error,
        language: payload.language,
        os: payload.os,
        name: payload.name,
        idl: payload.idl,
      }),
  }).mount('#main-container');
});
