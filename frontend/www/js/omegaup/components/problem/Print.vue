<template>
  <div class="mt-4">
    <a href="" @click="() => $emit('print-page')">
      <FontAwesomeIcon
        :title="T.contestAndProblemPrintButtonDesc"
        :icon="['fas', 'print']"
    /></a>
    <OmegaupProblemSettingsSummary :problem="problem" />
    <OmegaupMarkdown
      :markdown="problem.statement.markdown"
      :source-mapping="problem.statement.sources"
      :image-mapping="problem.statement.images"
      :problem-settings="problem.settings"
    />
  </div>
</template>

<script setup lang="ts">
import { types } from '../../api_types';
import T from '../../lang';
import OmegaupProblemSettingsSummary from './SettingsSummary.vue';
import OmegaupMarkdown from './ProblemMarkdown.vue';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faPrint } from '@fortawesome/free-solid-svg-icons';
library.add(faPrint);

defineProps<{
  problem: types.ProblemInfo;
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
