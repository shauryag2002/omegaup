import { OmegaUp } from '../omegaup';
import { types } from '../api_types';
import * as ui from '../ui';
import T from '../lang';
import { createApp, h } from 'vue';
import certificate_Mine from '../components/certificate/Mine.vue';

OmegaUp.on('ready', () => {
  const payload = types.payloadParsers.CertificateListMinePayload();
  createApp({
    render: () =>
      h(certificate_Mine, {
        certificates: payload.certificates,
        selectedCertificate: window.location.hash.substr(1).split('/')[0],
        location: window.location.origin,
        onShowCopyMessage: (): void => {
          ui.success(T.certificateListMineLinkCopiedToClipboard);
        },
        onShowDownloadMessage: (): void => {
          ui.success(T.certificateListMineFileDownloaded);
        },
      }),
  }).mount('#main-container');
});
