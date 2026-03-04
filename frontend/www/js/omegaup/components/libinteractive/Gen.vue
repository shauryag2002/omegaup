<template>
  <b-card>
    <b-card-body>
      <form
        action="/libinteractive/gen/"
        method="post"
        @submit="currentError = null"
      >
        <div class="form-group">
          <label for="language">{{ T.libinteractiveLanguage }}</label>
          <select
            v-model="currentLanguage"
            class="custom-select"
            name="language"
            :class="{ 'is-invalid': errorField === 'language' }"
            required
          >
            <option value="cpp">C++</option>
            <option value="c">C</option>
            <option value="java">Java</option>
          </select>
        </div>
        <div class="form-group">
          <label for="os">{{ T.libinteractiveOs }}</label>
          <select
            v-model="currentOs"
            class="custom-select"
            name="os"
            :class="{ 'is-invalid': errorField === 'os' }"
            required
          >
            <option value="windows">Windows</option>
            <option value="unix">Linux/Mac OS</option>
          </select>
        </div>
        <div class="form-group">
          <label for="name">{{ T.libinteractiveIdlFilename }}</label>
          <input
            v-model="currentName"
            type="text"
            class="form-control"
            name="name"
            :class="{ 'is-invalid': errorField === 'name' }"
            required
          />
          <p>{{ T.libinteractiveIdlFilenameHelp }}</p>
        </div>
        <div class="form-group">
          <label for="idl">IDL</label>
          <textarea
            v-model="currentIdl"
            class="form-control"
            rows="10"
            name="idl"
            :class="{ 'is-invalid': errorField === 'idl' }"
            required
          ></textarea>
        </div>
        <div class="form-group text-right">
          <b-button variant="primary" type="submit">
            <FontAwesomeIcon
              :icon="['fas', 'cloud-arrow-down']"
              aria-hidden="true"
            />
            {{ T.wordsDownload }}
          </b-button>
        </div>
      </form>
    </b-card-body>
    <b-card-body v-if="errorDescription" class="panel-footer">
      <pre><code class="w-100">{{ errorDescription }}</code></pre>
    </b-card-body>
  </b-card>
</template>

<script lang="ts">
import { defineComponent, ref, computed, PropType } from 'vue';
import T from '../../lang';

// Import Bootstrap an BootstrapVue CSS files (order is important)
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css';
import { BButton, BCard, BCardBody } from 'bootstrap-vue-next';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCloudArrowDown } from '@fortawesome/free-solid-svg-icons';
library.add(faCloudArrowDown);

import { types } from '../../api_types';

export default defineComponent({
  name: 'LibinteractiveGen',
  components: {
    FontAwesomeIcon,
  },
  props: {
    error: {
      type: Object as PropType<types.LibinteractiveError | null>,
      default: null,
    },
    language: { type: String, required: true },
    os: { type: String, required: true },
    name: { type: String, required: true },
    idl: { type: String, required: true },
  },
  setup(props) {
    const currentLanguage = ref(props.language);
    const currentOs = ref(props.os);
    const currentName = ref(props.name);
    const currentIdl = ref(props.idl);
    const currentError = ref(props.error);

    const errorDescription = computed(
      (): null | string => currentError.value?.description ?? null,
    );
    const errorField = computed(
      (): null | string => currentError.value?.field ?? null,
    );

    return {
      T,
      currentLanguage,
      currentOs,
      currentName,
      currentIdl,
      currentError,
      errorDescription,
      errorField,
    };
  },
});
</script>

<style lang="scss" scoped>
@import '../../../../sass/main.scss';
</style>
