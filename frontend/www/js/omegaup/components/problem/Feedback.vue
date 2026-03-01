<template>
  <div
    v-if="qualityHistogram || difficultyHistogram"
    class="row omegaup-feedback-row"
  >
    <h5 class="omegaup-feedback-title w-100">{{ T.wordsUsersFeedback }}</h5>
    <div v-if="qualityHistogram" :class="containerClass">
      <OmegaupProblemHistogram
        :histogram="qualityHistogram"
        :score="qualityScore"
        :type="HistogramType.Quality"
      />
    </div>
    <div v-if="difficultyHistogram" :class="containerClass">
      <OmegaupProblemHistogram
        :histogram="difficultyHistogram"
        :score="difficultyScore"
        :type="HistogramType.Difficulty"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import T from '../../lang';
import OmegaupProblemHistogram, { HistogramType } from './Histogram.vue';

const props = defineProps<{
  qualityHistogram: number[];
  difficultyHistogram: number[];
  qualityScore: number;
  difficultyScore: number;
}>();

const containerClass = computed((): string => {
  return props.qualityHistogram && props.difficultyHistogram
    ? 'col-md-6'
    : 'col-md-12';
});
</script>

<style>
.omegaup-feedback-row {
  margin: 30px auto 0;
}

.omegaup-feedback-title {
  font-weight: bold;
  color: gray;
}
</style>
