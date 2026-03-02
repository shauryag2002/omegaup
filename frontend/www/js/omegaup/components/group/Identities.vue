<template>
  <div class="card">
    <div v-if="isOrganizer" class="card-body introjs-info">
      <div class="mb-4">
        <omegaup-markdown
          :markdown="T.groupsCsvHelp"
          class="introjs-information"
        ></omegaup-markdown>
        <div class="form-check mb-4 introjs-password">
          <label class="form-check-label">
            <input
              v-model="humanReadable"
              class="form-check-input"
              type="checkbox"
            />
            {{ T.passwordHumanReadable }}
          </label>
        </div>
        {{ T.groupsUploadCsvFile }}
        <input
          name="identities"
          type="file"
          accept=".csv,.txt"
          class="introjs-upload"
          @change="readCsv"
        />
      </div>
      <template v-if="identities.length > 0">
        <h3 class="card-header">{{ T.wordsIdentities }}</h3>
        <div class="table-responsive">
          <table class="table" data-identities-table>
            <thead>
              <tr>
                <th>{{ T.profileUsername }}</th>
                <th>{{ T.profile }}</th>
                <th>{{ T.loginPassword }}</th>
                <th>{{ T.profileCountry }}</th>
                <th>{{ T.profileState }}</th>
                <th>{{ T.wordsGender }}</th>
                <th>{{ T.profileSchool }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="identity in identities"
                :key="identity.username"
                :class="{ 'alert-danger': userErrorRow === identity.username }"
              >
                <td class="username" data-identity-username>
                  <strong>{{ identity.username }}</strong>
                </td>
                <td>{{ identity.name }}</td>
                <td class="password" data-identity-password>
                  {{ identity.password }}
                </td>
                <td>
                  {{
                    identity.country_id === 'xx'
                      ? T.countryNotSet
                      : identity.country_id
                  }}
                </td>
                <td>{{ identity.state_id }}</td>
                <td>{{ identity.gender }}</td>
                <td>{{ identity.school_name }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="card-footer">
          <button
            class="btn btn-primary d-inline-block mb-2"
            name="create-identities"
            @click.prevent="$emit('bulk-identities', identities)"
          >
            {{ T.groupCreateIdentities }}
          </button>
          <div>
            <button
              class="btn btn-warning d-inline-block"
              @click.prevent="
                $emit('download-identities', identities, humanReadable)
              "
            >
              <font-awesome-icon :icon="['fas', 'download']" />
            </button>
            {{ T.groupsIdentityWarning }}
          </div>
        </div>
      </template>
    </div>
    <div v-else class="mt-5">
      <omegaup-markdown
        :markdown="T.groupIdentitiesNotRequiredPrivileges"
      ></omegaup-markdown>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, PropType } from 'vue';
import { types } from '../../api_types';
import T from '../../lang';
import omegaup_Markdown from '../Markdown.vue';
import 'intro.js/introjs.css';
import introJs from 'intro.js';
import { getCookie, setCookie } from '../../cookies';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
library.add(faDownload);

export default defineComponent({
  name: 'Identities',
  components: {
    FontAwesomeIcon,
    'omegaup-markdown': omegaup_Markdown,
  },
  props: {
    groupAlias: {
      type: String,
      required: true,
    },
    userErrorRow: {
      type: String as PropType<string | null>,
      default: null,
    },
    hasVisitedSection: {
      type: Boolean,
      required: true,
    },
    isOrganizer: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['bulk-identities', 'download-identities', 'invalid-file', 'read-csv'],
  setup(props, { emit }) {
    const identities = ref<types.Identity[]>([]);
    const humanReadable = ref(false);

    onMounted(() => {
      if (!props.isOrganizer) {
        return;
      }
      const title = T.createIdentitiesInteractiveGuideTitle;
      if (!props.hasVisitedSection) {
        introJs()
          .setOptions({
            nextLabel: T.interactiveGuideNextButton,
            prevLabel: T.interactiveGuidePreviousButton,
            doneLabel: T.interactiveGuideDoneButton,
            steps: [
              {
                title,
                intro: T.createIdentitiesInteractiveGuideWelcome,
              },
              {
                element: document.querySelector<HTMLElement>(
                  '.introjs-information p:nth-child(1)',
                ),
                title,
                intro: T.createIdentitiesInteractiveGuideInformation,
              },
              {
                element: document.querySelector<HTMLElement>(
                  '.introjs-information p:nth-child(2)',
                ),
                title,
                intro: T.createIdentitiesInteractiveGuideFormat,
              },
              {
                element: document.querySelector<HTMLElement>(
                  '.introjs-information pre',
                ),
                title,
                intro: T.createIdentitiesInteractiveGuideExample,
              },
              {
                element: document.querySelector<HTMLElement>(
                  '.introjs-information button',
                ),
                title,
                intro: T.createIdentitiesInteractiveGuideCopy,
              },
              {
                element: document.querySelector<HTMLElement>('.introjs-password'),
                title,
                intro: T.createIdentitiesInteractiveGuidePassword,
              },
              {
                element: document.querySelector<HTMLElement>('.introjs-upload'),
                title,
                intro: T.createIdentitiesInteractiveGuideUpload,
              },
              {
                element: document.querySelector<HTMLElement>('.introjs-info'),
                title,
                intro: T.createIdentitiesInteractiveGuideInformationPassword,
              },
              {
                element: document.querySelector<HTMLElement>('.introjs-info'),
                title,
                intro: T.createIdentitiesInteractiveGuideInformationConfirm,
              },
            ],
          })
          .start();
        setCookie('has-visited-create-identities', true);
      }
    });

    function readFile(e: HTMLInputElement): File | null {
      return (e.files && e.files[0]) || null;
    }

    function readCsv(ev: Event): void {
      const file = readFile(ev.target as HTMLInputElement);
      if (!file || file.name === '') {
        return;
      }

      const regex = /.*\.(?:csv|txt)$/;

      if (!regex.test(file.name.toLowerCase())) {
        emit('invalid-file');
        return;
      }

      identities.value = [];
      emit('read-csv', {
        identities: identities.value,
        file: file,
        humanReadable: humanReadable.value,
      });
    }

    return {
      T,
      identities,
      humanReadable,
      readCsv,
    };
  },
});
</script>
