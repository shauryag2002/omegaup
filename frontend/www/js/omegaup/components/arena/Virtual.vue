<template>
  <div class="contest panel">
    <div class="panel-body">
      <div class="text-center">
        <h2>{{ ui.formatString(T.virtualTitle, { title: title }) }}</h2>
        <span>{{ time.formatDelta(finishTime - startTime) }}</span>
        <form class="form" @submit.prevent="onSubmit">
          <div class="row">
            <div class="form-group col-md-4"></div>
            <div class="form-group col-md-4">
              <label>{{ T.contestNewFormStartDate }}</label>
              <OmegaupDatetimepicker
                v-model="virtualContestStartTime"
              ></OmegaupDatetimepicker>
            </div>
            <div class="form-group col-md-4"></div>
          </div>
          <button
            class="btn btn-primary"
            type="submit"
            data-schedule-virtual-button
          >
            {{ T.contestNewFormScheduleVirtualContest }}
          </button>
        </form>
      </div>
      <hr />
      <div class="">
        <h1>{{ T.registerForContestChallenges }}</h1>
        <p>{{ description }}</p>
      </div>
      <div class="">
        <h1>{{ T.registerForContestRules }}</h1>
        <ul>
          <li>
            {{
              ui.formatString(T.contestIntroScoreboardTimePercent, {
                window_length: scoreboard,
              })
            }}
          </li>
          <li>
            {{
              ui.formatString(T.contestIntroSubmissionsSeparationDesc, {
                window_length: Math.floor(submissionsGap / 60),
              })
            }}
          </li>
        </ul>
      </div>
    </div>
    <!-- div contest-details -->
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import T from '../../lang';
import * as ui from '../../ui';
import * as time from '../../time';
import OmegaupDatetimepicker from '../DateTimePicker.vue';

const props = defineProps<{
  title: string;
  description: string;
  startTime: Date;
  finishTime: Date;
  scoreboard: string;
  submissionsGap: number;
}>();

const emit = defineEmits<{
  (e: 'submit', payload: { virtualContestStartTime: Date }): void;
}>();

const virtualContestStartTime = ref(new Date());

function onSubmit(): void {
  emit('submit', {
    virtualContestStartTime: virtualContestStartTime.value,
  });
}
</script>
