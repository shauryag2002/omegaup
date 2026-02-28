<template>
  <div>
    <a @click="() => $emit('print-page')">
      <font-awesome-icon
        :title="T.contestAndProblemPrintButtonDesc"
        :icon="['fas', 'print']"
    /></a>
    <div v-for="problem in problems" :key="problem.alias" class="mt-3">
      <OmegaupProblemSettingsSummary
        :problem="problem"
        :problemset-title="contestTitle"
      />
      <OmegaupMarkdown
        :markdown="problem.statement.markdown"
        :source-mapping="problem.statement.sources"
        :image-mapping="problem.statement.images"
        :problem-settings="problem.settings"
      />
      <hr />
    </div>
  </div>
</template>

<script setup lang="ts">
import { types } from '../../api_types';
import T from '../../lang';
import OmegaupProblemSettingsSummary from '../problem/SettingsSummary.vue';
import OmegaupMarkdown from '../Markdown.vue';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faPrint } from '@fortawesome/free-solid-svg-icons';
library.add(faPrint);

defineProps<{
  problems: types.ProblemDetails[];
  contestTitle: string;
}>();

defineEmits<{
  (e: 'print-page'): void;
}>();
</script>

<style lang="scss" scoped>
@import '../../../../sass/main.scss';

table td {
  padding: 0.5rem;
}
</style>
