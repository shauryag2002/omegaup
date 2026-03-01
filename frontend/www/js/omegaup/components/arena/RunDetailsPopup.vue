<template>
  <OmegaupOverlayPopup @dismiss="emit('dismiss')">
    <div v-if="data">
      <form data-run-details-view>
        <slot
          name="feedback"
          :feedback="data.feedback"
          :guid="data.guid"
          :is-admin="data.admin"
        ></slot>
        <div class="source_code">
          <h3>{{ T.wordsCode }}</h3>
          <a v-if="data.source_link" download="data.zip" :href="data.source">{{
            T.wordsDownload
          }}</a>
          <slot v-else name="code-view" :guid="data.guid">
            <OmegaupArenaFeedbackCodeView
              :language="language"
              :value="source"
              :feedback-map="feedbackMap"
              :feedback-thread-map="feedbackThreadMap"
              @save-feedback-list="
                (feedbackList) => onSaveFeedbackList(feedbackList, data.guid)
              "
              @submit-feedback-thread="
                (feedback) => onSubmitFeedbackThread(feedback, data.guid)
              "
            ></OmegaupArenaFeedbackCodeView>
          </slot>
        </div>
        <div v-if="data.groups" class="cases">
          <h3>{{ T.wordsCases }}</h3>
          <div></div>
          <table class="w-100">
            <thead>
              <tr class="text-center">
                <th>{{ T.wordsGroup }}</th>
                <th v-if="data.feedback !== 'summary'">{{ T.wordsCase }}</th>
                <th>{{ T.wordsVerdict }}</th>
                <th colspan="3">{{ T.rankScore }}</th>
                <th width="1"></th>
              </tr>
            </thead>
            <tbody v-for="element in data.groups" :key="element.group">
              <tr class="group border-top">
                <th class="text-center">{{ element.group }}</th>
                <th v-if="element.verdict" class="text-center">
                  {{ element.verdict }}
                </th>
                <th v-else colspan="2">
                  <div
                    class="w-100 h-100 my-0 mx-auto text-center bg-white text-dark rounded"
                    @click="toggle(element.group)"
                  >
                    <FontAwesomeIcon
                      v-if="groupVisible[element.group]"
                      :icon="['fas', 'chevron-circle-up']"
                    />
                    <FontAwesomeIcon
                      v-else
                      :icon="['fas', 'chevron-circle-down']"
                    />
                  </div>
                </th>
                <th class="text-right">
                  {{
                    element.contest_score
                      ? element.contest_score
                      : element.score
                  }}
                </th>
                <template v-if="element.max_score">
                  <th class="text-center" width="10">/</th>
                  <th>{{ element.max_score }}</th>
                </template>
              </tr>
              <template v-if="groupVisible[element.group]">
                <template
                  v-for="problemCase in element.cases"
                  :key="problemCase.name"
                >
                  <tr>
                    <td></td>
                    <td class="text-center">{{ problemCase.name }}</td>
                    <td class="text-center">{{ problemCase.verdict }}</td>
                    <td class="text-right">
                      {{ contestScore(problemCase) }}
                    </td>
                    <td class="text-center" width="10">
                      {{ problemCase.max_score ? '/' : '' }}
                    </td>
                    <td>
                      {{ problemCase.max_score ? problemCase.max_score : '' }}
                    </td>
                  </tr>
                  <template v-if="shouldShowDiffs(problemCase.name)">
                    <tr :key="`input-title-${problemCase.name}`">
                      <td colspan="6">{{ T.wordsInput }}</td>
                    </tr>
                    <tr :key="`input-${problemCase.name}`">
                      <td colspan="6">
                        <pre>
                          <code>{{
                            showDataCase(data.cases, problemCase.name, 'in')
                          }}</code>
                        </pre>
                      </td>
                    </tr>
                    <tr :key="`diffs-title-${problemCase.name}`">
                      <td colspan="6">{{ T.wordsDifference }}</td>
                    </tr>
                    <tr :key="`diffs-${problemCase.name}`">
                      <td v-if="data.cases" colspan="6">
                        <OmegaupArenaDiffView
                          :left="data.cases[problemCase.name].out"
                          :right="
                            getContestantOutput(data.cases, problemCase.name)
                          "
                        ></OmegaupArenaDiffView>
                      </td>
                      <td v-else colspan="6" class="empty-table-message">
                        {{ EMPTY_FIELD }}
                      </td>
                    </tr>
                  </template>
                </template>
              </template>
            </tbody>
          </table>
        </div>
        <div v-if="data.compile_error" class="compile_error">
          <h3>{{ T.wordsCompilerOutput }}</h3>
          <pre class="compile_error">
            <code v-text="data.compile_error"></code>
          </pre>
        </div>
        <div v-if="data.logs" class="logs">
          <h3>{{ T.wordsLogs }}</h3>
          <pre>
            <code v-text="data.logs"></code>
          </pre>
        </div>
        <div class="download">
          <h3>{{ T.wordsDownload }}</h3>
          <ul>
            <li>
              <a
                class="sourcecode"
                :download="data.source_name"
                :href="data.source_url"
                >{{ T.wordsDownloadCode }}</a
              >
            </li>
            <li>
              <a
                v-if="data.admin"
                class="output"
                :href="`/api/run/download/run_alias/${data.guid}/`"
                >{{ T.wordsDownloadOutput }}</a
              >
            </li>
            <li>
              <a
                v-if="data.admin"
                class="details"
                :href="`/api/run/download/run_alias/${data.guid}/complete/true/`"
                >{{ T.wordsDownloadDetails }}</a
              >
            </li>
          </ul>
        </div>
        <div v-if="data.judged_by" class="judged_by">
          <h3>{{ T.wordsJudgedBy }}</h3>
          <pre>
            <code v-text="data.judged_by"></code>
          </pre>
        </div>
        <div class="guid">
          <h3>{{ T.runGUID }}</h3>
          <acronym :title="data.guid" data-run-guid>
            <tt>{{ shortGuid }}</tt>
          </acronym>
        </div>
      </form>
    </div>
    <div v-else>
      <div class="spinner-border text-info big" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>
  </OmegaupOverlayPopup>
</template>

<script setup lang="ts">
import { ref, computed, getCurrentInstance } from 'vue';
import { types } from '../../api_types';
import T from '../../lang';
import OmegaupArenaDiffView from './DiffView.vue';
import OmegaupOverlayPopup from '../OverlayPopup.vue';
import { ArenaCourseFeedback } from './Feedback.vue';
import OmegaupArenaFeedbackCodeView from './FeedbackCodeView.vue';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faChevronCircleUp,
  faChevronCircleDown,
} from '@fortawesome/free-solid-svg-icons';
library.add(faChevronCircleUp);
library.add(faChevronCircleDown);

interface GroupVisibility {
  [name: string]: boolean;
}

const EMPTY_FIELD = '∅';

const props = withDefaults(
  defineProps<{
    data: types.RunDetails;
    feedbackMap?: Map<number, ArenaCourseFeedback>;
    feedbackThreadMap?: Map<number, ArenaCourseFeedback>;
  }>(),
  {
    feedbackMap: () => new Map<number, ArenaCourseFeedback>(),
    feedbackThreadMap: () => new Map<number, ArenaCourseFeedback>(),
  },
);

const emit = defineEmits<{
  (e: 'dismiss'): void;
}>();

const groupVisible = ref<GroupVisibility>({});

const language = computed((): string | undefined => {
  return props.data?.language;
});

const source = computed((): string | undefined => {
  return props.data?.source;
});

const shortGuid = computed((): string => {
  return props.data.guid.substring(0, 8);
});

function toggle(group: string): void {
  const visible = groupVisible.value[group];
  groupVisible.value[group] = !visible;
}

function showDataCase(
  cases: types.ProblemCasesContents,
  caseName: string,
  caseType: 'in' | 'out' | 'contestantOutput',
): string {
  return cases[caseName]?.[caseType] ?? EMPTY_FIELD;
}

function shouldShowDiffs(caseName: string): boolean {
  return (
    props.data.show_diff === 'all' ||
    (caseName === 'sample' && props.data.show_diff === 'examples')
  );
}

function getContestantOutput(
  cases: types.ProblemCasesContents,
  name: string,
): string {
  return cases[name]?.contestantOutput ?? '';
}

function contestScore(problemCase: types.CaseResult): number {
  return problemCase.contest_score ?? problemCase.score;
}

// TODO: Replace with proper event bus or provide/inject
function onSaveFeedbackList(
  feedbackList: { lineNumber: number; feedback: string }[],
  guid: string,
) {
  getCurrentInstance()?.proxy?.$parent?.$parent?.$parent?.$parent?.$emit(
    'save-feedback-list',
    {
      feedbackList,
      guid,
    },
  );
}

// TODO: Replace with proper event bus or provide/inject
function onSubmitFeedbackThread(feedback: ArenaCourseFeedback, guid: string) {
  getCurrentInstance()?.proxy?.$parent?.$parent?.$parent?.$parent?.$emit(
    'submit-feedback-thread',
    {
      feedback,
      guid,
    },
  );
}
</script>

<style lang="scss" scoped>
.big {
  height: 3rem;
  width: 3rem;
}
</style>
