<template>
  <div class="card">
    <h5 class="card-header d-flex justify-content-between align-items-center">
      {{ T.certificateListMineTitle }}
    </h5>
    <div v-if="certificates.length === 0">
      <div class="my-2 empty-table-message">
        {{ T.certificateListMineCertificatesEmpty }}
      </div>
    </div>
    <table v-else class="table table-striped table-hover mb-0">
      <thead>
        <tr>
          <th scope="col" class="text-left align-middle">
            {{ T.certificateListMineDate }}
          </th>
          <th scope="col" class="text-left align-middle">
            {{ T.certificateListMineReason }}
          </th>
          <th scope="col" class="text-left align-middle d-none d-md-table-cell">
            {{ T.certificateListMineVerificationLink }}
          </th>
          <th scope="col" class="text-left align-middle">
            {{ T.certificateListMineActions }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(certificate, index) in certificates" :key="index">
          <td
            v-if="selectedCertificate === certificate.verification_code"
            class="text-left align-middle border-selected"
          >
            {{ certificate.date.toLocaleDateString() }}
          </td>
          <td v-else class="text-left align-middle">
            {{ certificate.date.toLocaleDateString() }}
          </td>
          <td class="text-left align-middle">
            {{ getReason(certificate.name, certificate.certificate_type) }}
          </td>
          <td class="text-left align-middle d-none d-md-table-cell">
            <span class="bg-light rounded border p-2 d-block w-100">
              {{ getVerificationLink(certificate.verification_code) }}
            </span>
          </td>
          <td class="d-flex align-items-center">
            <button
              copy-to-clipboard
              class="btn btn-primary mr-2"
              type="button"
              :title="T.certificateListMineCopyToClipboard"
              :data-code="certificate.verification_code"
              @click="
                copyAndNotify(
                  getVerificationLink(certificate.verification_code),
                )
              "
            >
              <font-awesome-icon icon="clipboard" />
            </button>
            <a
              download-file
              class="btn btn-primary"
              type="button"
              :href="getDownloadLink(certificate.verification_code)"
              :title="T.certificateListMineDownload"
              :data-code="certificate.verification_code"
              @click="onDownloadCertificate"
            >
              <font-awesome-icon icon="file-download" />
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { types } from '../../api_types';
import T from '../../lang';
import * as ui from '../../ui';
import {
  FontAwesomeIcon,
  FontAwesomeLayers,
  FontAwesomeLayersText,
} from '@fortawesome/vue-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
library.add(fas);

export default defineComponent({
  name: 'Mine',
  components: {
    'font-awesome-icon': FontAwesomeIcon,
    'font-awesome-layers': FontAwesomeLayers,
    'font-awesome-layers-text': FontAwesomeLayersText,
  },
  props: {
    certificates: {
      type: Array as PropType<types.CertificateListItem[]>,
      required: true,
    },
    selectedCertificate: { type: String, default: undefined },
    location: { type: String, required: true },
  },
  emits: ['show-copy-message', 'show-download-message'],
  setup(props, { emit }) {
    function getDownloadLink(verificationCode: string): string {
      return `${props.location}/certificate/${verificationCode}.pdf/`;
    }

    function getVerificationLink(verificationCode: string): string {
      return `${props.location}/cert/${verificationCode}/`;
    }

    function getReason(name: string | null, type: string): string {
      if (name === null) {
        return type === 'coder_of_the_month'
          ? T.certificateListMineCoderOfTheMonth
          : T.certificateListMineCoderOfTheMonthFemale;
      }
      if (type === 'contest') {
        return ui.formatString(T.certificateListMineContest, {
          contest_title: name,
        });
      }
      return ui.formatString(T.certificateListMineCourse, {
        course_name: name,
      });
    }

    function copyAndNotify(text: string): void {
      navigator.clipboard.writeText(text);
      emit('show-copy-message');
    }

    function onCopyVerificationLink(): void {
      emit('show-copy-message');
    }

    function onDownloadCertificate(): void {
      emit('show-download-message');
    }

    return {
      T,
      ui,
      getDownloadLink,
      getVerificationLink,
      getReason,
      copyAndNotify,
      onCopyVerificationLink,
      onDownloadCertificate,
    };
  },
});
</script>

<style lang="scss" scoped>
@import '../../../../sass/main.scss';

.border-selected {
  border-left: 0.25rem solid
    var(--certificates-selected-certificate-border-color);
}
</style>
