<template>
  <div class="card">
    <h3 class="card-header">
      {{
        ui.formatString(T.groupEditScoreboardsEdit, { scoreboard: scoreboard })
      }}
    </h3>
    <div class="card-body">
      <form class="form" @submit.prevent="onAddContest">
        <div class="row">
          <div class="form-group col-md-6">
            <label class="w-100"
              >{{ T.wordsContests }}
              <select v-model="selectedContest" class="form-control" required>
                <option
                  v-for="contest in availableContests"
                  :key="contest.alias"
                  :value="contest.alias"
                >
                  {{ contest.title }}
                </option>
              </select>
            </label>
          </div>

          <div class="form-group col-md-3">
            <label class="w-100"
              >{{ T.groupNewFormOnlyAC }}
              <OmegaupRadioSwitch
                :value.sync="onlyAc"
                :selected-value="onlyAc"
              ></OmegaupRadioSwitch>
            </label>
          </div>

          <div class="form-group col-md-3">
            <label class="w-100"
              >{{ T.groupNewFormWeight }}
              <input
                v-model="weight"
                name="weight"
                type="number"
                size="4"
                class="form-control"
                required
              />
            </label>
          </div>
        </div>

        <div class="row">
          <div class="form-group col-md-6">
            <button class="btn btn-primary" type="submit">
              {{ T.groupEditScoreboardsAddContest }}
            </button>
          </div>
        </div>
      </form>
    </div>

    <table class="table table-striped">
      <thead>
        <tr>
          <th>{{ T.wordsContests }}</th>
          <th>{{ T.groupNewFormOnlyAC }}</th>
          <th>{{ T.groupNewFormWeight }}</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="contest in contests" :key="contest.alias">
          <td data-contest-alias>
            <a :href="ui.contestURL(contest)">{{ ui.contestTitle(contest) }}</a>
          </td>
          <td data-contest-only-ac>
            {{ contest.only_ac ? T.wordsYes : T.wordsNo }}
          </td>
          <td data-contest-weight>{{ contest.weight }}</td>
          <td data-contest-actions>
            <button
              class="btn btn-link"
              @click="$emit('remove-contest', contest.alias)"
            >
              <font-awesome-icon
                :icon="['fas', 'trash']"
                :title="T.wordsDelete"
              />
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, defineExpose } from 'vue';
import T from '../../lang';
import * as ui from '../../ui';
import { types } from '../../api_types';
import OmegaupRadioSwitch from '../RadioSwitch.vue';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
library.add(faTrash);

defineProps<{
  scoreboard: string;
  availableContests: types.ContestListItem[];
  contests: types.ScoreboardContest[];
}>();

const emit = defineEmits<{
  (
    e: 'add-contest',
    component: any,
    contest: string | null,
    onlyAc: boolean,
    weight: number,
  ): void;
  (e: 'remove-contest', alias: string): void;
}>();

const selectedContest = ref<string | null>(null);
const onlyAc = ref(false);
const weight = ref(1.0);

function onAddContest(): void {
  emit(
    'add-contest',
    { reset },
    selectedContest.value,
    onlyAc.value,
    weight.value,
  );
}

function reset(): void {
  selectedContest.value = null;
  onlyAc.value = false;
  weight.value = 1.0;
}

defineExpose({ reset });
</script>
