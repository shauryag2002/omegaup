<template>
  <div class="post">
    <div class="copy">
      <h1>{{ T.liveStatistics }}</h1>
      <div class="total-runs">
        {{ totalRuns }}
      </div>
      <Highcharts :options="verdictChartOptions"></Highcharts>
      <Highcharts :options="distributionChartOptions"></Highcharts>
      <Highcharts :options="pendingChartOptions"></Highcharts>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { omegaup } from '../../omegaup';
import T from '../../lang';
import * as ui from '../../ui';
import { Chart as Highcharts } from 'highcharts-vue';

const props = defineProps<{
  stats: omegaup.Stats;
  verdictChartOptions: Chart;
  distributionChartOptions: Chart;
  pendingChartOptions: Chart;
}>();

const emit = defineEmits<{
  (e: 'update-series', value: omegaup.Stats): void;
}>();

const totalRuns = computed((): string => {
  return ui.formatString(T.totalRuns, { numRuns: props.stats.total_runs });
});

watch(
  () => props.stats,
  (newValue: omegaup.Stats) => {
    emit('update-series', newValue);
  },
);
</script>
