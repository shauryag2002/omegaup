<template>
  <div class="summary main">
    <h1>{{ title }}</h1>
    <OmegaupMarkdown :markdown="eventDescription" />
    <table
      v-if="finishTime !== null"
      class="table table-bordered mx-auto w-50 mb-0"
    >
      <tr v-if="showDeadlines">
        <td>
          <strong>{{ T.arenaPracticeStartTime }}</strong>
        </td>
        <td>{{ time.formatTimestamp(startTime) }}</td>
      </tr>
      <tr v-if="showDeadlines">
        <td>
          <strong>{{ T.arenaPracticeEndtime }}</strong>
        </td>
        <td>
          {{
            finishTime
              ? time.formatTimestamp(finishTime)
              : T.wordsUnlimitedDuration
          }}
        </td>
      </tr>
      <tr
        v-if="
          showRanking && typeof scoreboard === 'number' && duration != Infinity
        "
      >
        <td>
          <strong>{{ T.arenaPracticeScoreboardCutoff }}</strong>
        </td>
        <td>
          {{
            time.formatTimestamp(
              new Date(starTime.getTime() + (duration * scoreboard) / 100),
            )
          }}
        </td>
      </tr>
      <tr>
        <td>
          <strong>{{ T.arenaContestWindowLength }}</strong>
        </td>
        <td>{{ eventWindowLength }}</td>
      </tr>
      <tr>
        <td>
          <strong>{{ T.arenaContestOrganizer }}</strong>
        </td>
        <td>
          <a :href="`/profile/${admin}/`">{{ admin }}</a>
        </td>
      </tr>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import T from '../../lang';
import * as time from '../../time';

import OmegaupMarkdown from '../Markdown.vue';

const props = withDefaults(
  defineProps<{
    title: string;
    description: string;
    startTime: Date;
    finishTime: Date;
    scoreboard: number;
    windowLength: null | number;
    admin: string;
    showDeadlines?: boolean;
    showRanking?: boolean;
  }>(),
  {
    showDeadlines: true,
    showRanking: true,
  },
);

const duration = computed((): number => {
  if (!props.startTime || !props.finishTime) {
    return Infinity;
  }
  return props.finishTime.getTime() - props.startTime.getTime();
});

const eventWindowLength = computed((): string => {
  if (duration.value === Infinity) {
    return T.wordsUnlimitedDuration;
  }
  if (props.windowLength) {
    // Convert minutes to milliseconds
    return time.formatDelta(props.windowLength * (60 * 1000));
  }
  return time.formatDelta(duration.value);
});

const eventDescription = computed((): string => {
  return props.description || '';
});
</script>

<style lang="scss" scoped>
@import '../../../../sass/main.scss';
.summary {
  background: var(--arena-summary-background-color);
  padding: 1em;
}

h1 {
  margin: 1em auto 1em auto;
  font-size: 1.5em;
}

@media only screen and (min-width: 960px) {
  .summary {
    margin-top: -1.5em;
    margin-right: -1em;
  }
}
</style>
