<template>
  <div class="mt-2" data-runs>
    <slot name="title">
      <div class="card-header">
        <h1 class="text-center">{{ T.wordsGlobalSubmissions }}</h1>
      </div>
    </slot>
    <div
      class="px-2 px-sm-4 border-0"
      :class="{
        'single-problem-runs': !showAllRuns,
        'all-runs': showAllRuns,
      }"
    >
      <div>
        <span class="font-weight-bold">{{ T.wordsSubmissions }}</span>
        <div v-if="showPager">
          <div class="pager-controls">
            <button
              data-button-page-previous
              :disabled="filterOffset <= 0"
              @click="filterOffset--"
            >
              &lt;
            </button>
            {{ currentPage }}
            <button
              data-button-page-next
              :disabled="
                totalRuns && Math.ceil(totalRuns / rowCount) == currentPage
              "
              @click="filterOffset++"
            >
              &gt;
            </button>
          </div>

          <div class="filters row">
            <label class="col-3 col-sm pr-0 font-weight-bold"
              >{{ T.wordsVerdict }}:
              <select
                v-model="filterVerdict"
                data-select-verdict
                class="form-control"
              >
                <option value="">{{ T.wordsAll }}</option>
                <option value="AC">AC</option>
                <option value="PA">PA</option>
                <option value="WA">WA</option>
                <option value="TLE">TLE</option>
                <option value="MLE">MLE</option>
                <option value="OLE">OLE</option>
                <option value="RTE">RTE</option>
                <option value="RFE">RFE</option>
                <option value="CE">CE</option>
                <option value="JE">JE</option>
                <option value="VE">VE</option>
                <option value="NO-AC">No AC</option>
              </select>
            </label>

            <label class="col-3 col-sm pr-0 font-weight-bold"
              >{{ T.wordsStatus }}:
              <select
                v-model="filterStatus"
                data-select-status
                class="form-control"
              >
                <option value="">{{ T.wordsAll }}</option>
                <option value="new">new</option>
                <option value="waiting">waiting</option>
                <option value="compiling">compiling</option>
                <option value="running">running</option>
                <option value="ready">ready</option>
              </select>
            </label>

            <label class="col-5 col-sm pr-0 font-weight-bold"
              >{{ T.wordsLanguage }}:
              <select
                v-model="filterLanguage"
                data-select-language
                class="form-control"
              >
                <option value="">{{ T.wordsAll }}</option>
                <option value="cpp20-gcc">C++20 (g++ 10.3)</option>
                <option value="cpp20-clang">C++20 (clang++ 10.0)</option>
                <option value="cpp17-gcc">C++17 (g++ 10.3)</option>
                <option value="cpp17-clang">C++17 (clang++ 10.0)</option>
                <option value="cpp11-gcc">C++11 (g++ 10.3)</option>
                <option value="cpp11-clang">C++11 (clang++ 10.0)</option>
                <option value="c11-gcc">C (gcc 10.3)</option>
                <option value="c11-clang">C (clang 10.0)</option>
                <option value="cs">C# (10, dotnet 6.0)</option>
                <option value="hs">Haskell (ghc 8.8)</option>
                <option value="java">Java (openjdk 16.0)</option>
                <option value="kt">Kotlin (1.6.10)</option>
                <option value="pas">Pascal (fpc 3.0)</option>
                <option value="py3">Python (3.9)</option>
                <option value="py2">Python (2.7)</option>
                <option value="rb">Ruby (2.7)</option>
                <option value="lua">Lua (5.3)</option>
                <option value="go">Go (1.18.beta2)</option>
                <option value="rs">Rust (1.56.1)</option>
                <option value="js">JavaScript (Node.js 16)</option>
                <option value="kp">Karel (Pascal)</option>
                <option value="kj">Karel (Java)</option>
                <option value="cat">{{ T.wordsJustOutput }}</option>
              </select>
            </label>

            <template v-if="showProblem">
              <label class="col-6 col-sm pr-1 font-weight-bold"
                >{{ T.wordsProblem }}:
                <OmegaupCommonTypeahead
                  data-search-problem
                  :existing-options="searchResultProblems"
                  v-model:value="filterProblem"
                  @update-existing-options="
                    (query) => emit('update-search-result-problems', query)
                  "
                ></OmegaupCommonTypeahead>
              </label>
              <button
                type="button"
                class="close"
                style="float: none"
                @click="filterProblem = null"
              >
                &times;
              </button>
            </template>

            <template v-if="showUser">
              <label class="col-5 col-sm font-weight-bold"
                >{{ T.contestParticipant }}:
                <OmegaupCommonTypeahead
                  data-search-username
                  :existing-options="searchResultUsers"
                  v-model:value="filterUsername"
                  :max-results="10"
                  @update-existing-options="updateSearchResultUsers"
                ></OmegaupCommonTypeahead>
              </label>
            </template>
          </div>

          <div class="row">
            <div v-if="filtersExcludingOffset.length > 0" class="col-sm col-12">
              <span
                v-for="filter in filtersExcludingOffset"
                :key="filter.name"
                class="btn-secondary mr-3"
              >
                <span class="mr-2">{{ filter.name }}: {{ filter.value }}</span>
                <a
                  :data-remove-filter="filter.name"
                  @click="onRemoveFilter(filter.name)"
                >
                  <font-awesome-icon :icon="['fas', 'times']" />
                </a>
              </span>
              <a
                href="#runs"
                data-remove-all-filters
                @click="onRemoveFilter('all')"
              >
                <span class="mr-2">{{ T.wordsRemoveFilter }}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table runs">
          <thead>
            <tr>
              <th class="text-nowrap">{{ T.wordsTime }}</th>
              <th>GUID</th>
              <th v-if="showUser">{{ T.contestParticipant }}</th>
              <th v-if="showContest">{{ T.wordsContest }}</th>
              <th v-if="showProblem">{{ T.wordsProblem }}</th>
              <th>{{ T.wordsStatus }}</th>
              <th v-if="showPoints" class="numeric">{{ T.wordsPoints }}</th>
              <th v-if="showPoints" class="numeric">{{ T.wordsPenalty }}</th>
              <th v-if="!showPoints" class="numeric">
                {{ T.wordsPercentage }}
              </th>
              <th>{{ T.wordsLanguage }}</th>
              <th class="numeric">{{ T.wordsMemory }}</th>
              <th class="numeric">{{ T.wordsRuntime }}</th>
              <th v-if="showDetails && !showDisqualify && !showRejudge">
                {{ T.arenaRunsActions }}
              </th>
              <th v-else></th>
            </tr>
          </thead>
          <tfoot v-if="problemAlias != null">
            <tr>
              <td colspan="10" data-new-run>
                <a
                  v-if="isContestFinished"
                  :href="`/arena/${contestAlias}/practice/`"
                  >{{ T.arenaContestEndedUsePractice }}</a
                >
                <button
                  v-else-if="useNewSubmissionButton"
                  class="w-100"
                  @click="emit('new-submission')"
                >
                  {{ newSubmissionDescription }}
                </button>
                <a
                  v-else
                  :href="newSubmissionUrl"
                  @click="emit('new-submission')"
                  >{{ newSubmissionDescription }}</a
                >
              </td>
            </tr>
          </tfoot>
          <tbody>
            <tr v-for="run in filteredRuns" :key="run.guid">
              <td>{{ time.formatDateLocalHHMM(run.time) }}</td>
              <td>
                <acronym :title="run.guid" data-run-guid>
                  <tt>{{ run.guid.substring(0, 8) }}</tt>
                </acronym>
              </td>
              <td
                v-if="showUser"
                class="text-break-all text-nowrap"
                :data-username="run.username"
              >
                <OmegaupUserUsername
                  :classname="run.classname"
                  :username="run.username"
                  :country="run.country_id"
                  :linkify="true"
                  :href="'#runs'"
                  :emit-click-event="true"
                  @click="
                    (username) =>
                      (filterUsername = { key: username, value: username })
                  "
                ></OmegaupUserUsername>
                <a :href="`/profile/${run.username}/`" class="ml-2">
                  <font-awesome-icon :icon="['fas', 'external-link-alt']" />
                </a>
              </td>
              <td v-if="showContest" class="text-break-all">
                <a
                  href="#runs"
                  @click="
                    onEmitFilterChanged({
                      filter: 'contest',
                      value: run.contest_alias,
                    })
                  "
                  >{{ run.contest_alias }}</a
                >
                <a
                  v-if="run.contest_alias"
                  :href="`/arena/${run.contest_alias}/`"
                  class="ml-2"
                >
                  <font-awesome-icon :icon="['fas', 'external-link-alt']" />
                </a>
              </td>
              <td v-if="showProblem" class="text-break-all">
                <a href="#runs" @click="setFilterProblem(run.alias)">{{
                  run.alias
                }}</a>
                <a
                  problem-navigation-button
                  :href="`/arena/problem/${run.alias}/`"
                  class="ml-2"
                >
                  <font-awesome-icon :icon="['fas', 'external-link-alt']" />
                </a>
              </td>
              <td
                :class="statusClass(run)"
                data-run-status
                class="text-center opacity-4 font-weight-bold"
              >
                <span class="mr-1">{{ status(run) }}</span>
                <button
                  v-if="!!statusHelp(run)"
                  type="button"
                  :data-content="statusHelp(run)"
                  data-toggle="popover"
                  data-trigger="focus"
                  class="btn-outline-dark btn-sm"
                  @click="showVerdictHelp"
                >
                  <font-awesome-icon :icon="['fas', 'question-circle']" />
                </button>
              </td>
              <td v-if="showPoints" class="numeric">{{ points(run) }}</td>
              <td v-if="showPoints" class="numeric">{{ penalty(run) }}</td>
              <td v-if="!showPoints" class="numeric">{{ percentage(run) }}</td>
              <td>{{ run.language }}</td>
              <td class="numeric">{{ memory(run) }}</td>
              <td class="numeric">{{ runtime(run) }}</td>
              <td v-if="showDetails && !showDisqualify && !showRejudge">
                <button
                  class="details btn-outline-dark btn-sm"
                  :data-run-details="run.guid"
                  @click="onRunDetails(run)"
                >
                  <font-awesome-icon :icon="['fas', 'search-plus']" />
                </button>
                <button
                  v-if="requestFeedback"
                  class="details btn-outline-dark btn-sm"
                  @click="emit('request-feedback', run.guid)"
                >
                  <font-awesome-icon
                    :title="T.courseRequestFeedback"
                    icon="comment-dots"
                  />
                </button>
              </td>
              <td
                v-else-if="showDetails || showDisqualify || showRejudge"
                :data-actions="run.guid"
              >
                <div class="dropdown">
                  <button
                    data-runs-actions-button
                    class="btn btn-secondary dropdown-toggle"
                    type="button"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    {{ T.arenaRunsActions }}
                  </button>
                  <div class="dropdown-menu">
                    <button
                      v-if="showDetails"
                      data-runs-show-details-button
                      :data-run-details="run.guid"
                      class="btn-link dropdown-item"
                      @click="onRunDetails(run)"
                    >
                      {{ T.arenaRunsActionsDetails }}
                    </button>
                    <button
                      v-if="showRejudge"
                      :data-actions-rejudge="run.guid"
                      class="btn-link dropdown-item"
                      @click="emit('rejudge', run)"
                    >
                      {{ T.arenaRunsActionsRejudge }}
                    </button>
                    <template v-if="showDisqualify">
                      <div class="dropdown-divider"></div>
                      <template v-if="run.type === 'normal'">
                        <button
                          :data-actions-disqualify-by-guid="run.guid"
                          class="btn-link dropdown-item"
                          @click="
                            emit('disqualify', {
                              run,
                              disqualificationType: DisqualificationType.ByGUID,
                            })
                          "
                        >
                          {{ T.arenaRunsActionsDisqualifyByGUID }}
                        </button>
                        <template v-if="inContest">
                          <button
                            :data-actions-disqualify-by-problem="run.guid"
                            class="btn-link dropdown-item"
                            @click="
                              emit('disqualify', {
                                run,
                                disqualificationType:
                                  DisqualificationType.ByProblem,
                              })
                            "
                          >
                            {{ T.arenaRunsActionsDisqualifyByProblem }}
                          </button>
                          <button
                            :data-actions-disqualify-by-user="run.guid"
                            class="btn-link dropdown-item"
                            @click="
                              emit('disqualify', {
                                run,
                                disqualificationType:
                                  DisqualificationType.ByUser,
                              })
                            "
                          >
                            {{ T.arenaRunsActionsDisqualifyByUser }}
                          </button>
                        </template>
                      </template>
                      <button
                        v-else-if="run.type === 'disqualified'"
                        :data-actions-requalify="run.guid"
                        class="btn-link dropdown-item"
                        @click="emit('requalify', run)"
                      >
                        {{ T.arenaRunsActionsRequalify }}
                      </button>
                    </template>
                  </div>
                </div>
              </td>
              <td v-else></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <slot name="runs">
      <OmegaupOverlay
        :show-overlay="currentPopupDisplayed !== PopupDisplayed.None"
        @hide-overlay="onPopupDismissed"
      >
        <template #popup>
          <OmegaupArenaRundetailsPopup
            v-show="currentPopupDisplayed === PopupDisplayed.RunDetails"
            :data="currentRunDetailsData"
            @dismiss="onPopupDismissed"
          ></OmegaupArenaRundetailsPopup>
        </template>
      </OmegaupOverlay>
    </slot>
  </div>
</template>

<script lang="ts">
export enum DisqualificationType {
  ByGUID,
  ByProblem,
  ByUser,
  ByUsers,
  ByUsersAndProblem,
  ByUserAndProblems,
  ByUsersAndProblems,
}

export enum PopupDisplayed {
  None,
  RunSubmit,
  RunDetails,
  Promotion,
  Demotion,
  Reviewer,
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface JQuery {
    popover(action: string): JQuery;
  }
}
export default {};
</script>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import T from '../../lang';
import { types } from '../../api_types';
import * as time from '../../time';
import OmegaupUserUsername from '../user/Username.vue';
import OmegaupCommonTypeahead from '../common/Typeahead.vue';
import OmegaupArenaRundetailsPopup from './RunDetailsPopup.vue';
import OmegaupOverlay from '../Overlay.vue';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faQuestionCircle,
  faRedoAlt,
  faBan,
  faSearchPlus,
  faExternalLinkAlt,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
library.add(faQuestionCircle);
library.add(faRedoAlt);
library.add(faBan);
library.add(faSearchPlus);
library.add(faExternalLinkAlt);
library.add(faTimes);

const props = withDefaults(
  defineProps<{
    isContestFinished?: boolean;
    isProblemsetOpened?: boolean;
    showContest?: boolean;
    showDetails?: boolean;
    showDisqualify?: boolean;
    showPager?: boolean;
    showPoints?: boolean;
    showProblem?: boolean;
    showRejudge?: boolean;
    showUser?: boolean;
    useNewSubmissionButton?: boolean;
    contestAlias?: string | null;
    problemAlias?: string | null;
    problemsetProblems?: types.ProblemsetProblem[];
    username?: string | null;
    rowCount?: number;
    runs: null | types.Run[];
    searchResultUsers: types.ListItem[];
    runDetailsData?: types.RunDetails | null;
    popupDisplayed?: PopupDisplayed;
    guid?: null | string;
    showAllRuns?: boolean;
    totalRuns: number;
    searchResultProblems: types.ListItem[];
    requestFeedback: boolean;
    inContest?: boolean;
  }>(),
  {
    isContestFinished: false,
    isProblemsetOpened: true,
    showContest: false,
    showDetails: false,
    showDisqualify: false,
    showPager: false,
    showPoints: false,
    showProblem: false,
    showRejudge: false,
    showUser: false,
    useNewSubmissionButton: false,
    contestAlias: null,
    problemAlias: null,
    problemsetProblems: () => [],
    username: null,
    rowCount: 100,
    runDetailsData: null,
    popupDisplayed: PopupDisplayed.None,
    guid: null,
    showAllRuns: false,
    inContest: false,
  },
);

const emit = defineEmits<{
  (
    e: 'details',
    request: { guid: string; isAdmin: boolean; hash: string },
  ): void;
  (e: 'rejudge', run: types.Run): void;
  (
    e: 'disqualify',
    request: { run: types.Run; disqualificationType: DisqualificationType },
  ): void;
  (e: 'requalify', run: types.Run): void;
  (
    e: 'filter-changed',
    request: { filter: string; value: null | string },
  ): void;
  (
    e: 'update-search-result-users-contest',
    request: { query: string; contestAlias: string },
  ): void;
  (e: 'update-search-result-users', request: { query: string }): void;
  (e: 'update-search-result-problems', query: string): void;
  (e: 'new-submission'): void;
  (e: 'reset-hash'): void;
  (e: 'request-feedback', guid: string): void;
}>();

const filterLanguage = ref<string>('');
const filterOffset = ref<number>(0);
const filterProblem = ref<null | types.ListItem>(null);
const filterStatus = ref<string>('');
const filterUsername = ref<null | types.ListItem>(null);
const filterVerdict = ref<string>('');
const filterContest = ref<string>('');
const filters = ref<{ name: string; value: string }[]>([]);
const currentRunDetailsData = ref(props.runDetailsData);
const currentPopupDisplayed = ref(props.popupDisplayed);

const currentPage = computed((): number => {
  return filterOffset.value + 1;
});

const sortedRuns = computed((): types.Run[] => {
  if (!props.runs) {
    return [];
  }
  return props.runs.slice().sort((a, b) => b.time.getTime() - a.time.getTime());
});

const filteredRuns = computed((): types.Run[] => {
  if (
    !filterLanguage.value &&
    !filterProblem.value &&
    !filterStatus.value &&
    !filterUsername.value &&
    !filterContest.value &&
    !filterVerdict.value
  ) {
    return sortedRuns.value;
  }
  return sortedRuns.value.filter((run) => {
    if (filterVerdict.value) {
      if (filterVerdict.value == 'NO-AC') {
        if (run.verdict == 'AC') {
          return false;
        }
      } else if (run.verdict != filterVerdict.value) {
        return false;
      }
    }
    if (filterLanguage.value && run.language !== filterLanguage.value) {
      return false;
    }
    if (filterProblem.value && run.alias !== filterProblem.value.key) {
      return false;
    }
    if (filterStatus.value && run.status !== filterStatus.value) {
      return false;
    }
    if (filterUsername.value && run.username !== filterUsername.value.key) {
      return false;
    }
    if (filterContest.value && run.contest_alias !== filterContest.value) {
      return false;
    }
    return true;
  });
});

const filtersExcludingOffset = computed(
  (): {
    name: string;
    value: string;
  }[] => {
    return filters.value.filter((filter) => filter.name !== 'offset');
  },
);

const newSubmissionUrl = computed((): string => {
  if (props.isProblemsetOpened) {
    return `#problems/${props.problemAlias}/new-run`;
  }
  return `/arena/${props.contestAlias}/`;
});

const newSubmissionDescription = computed((): string => {
  if (props.isProblemsetOpened) {
    return T.wordsNewSubmissions;
  }
  return T.arenaContestNotOpened;
});

function memory(run: types.Run): string {
  if (
    run.status == 'ready' &&
    run.verdict != 'JE' &&
    run.verdict != 'VE' &&
    run.verdict != 'CE'
  ) {
    let prefix = '';
    if (run.verdict == 'MLE') {
      prefix = '>';
    }
    return `${prefix}${(run.memory / (1024 * 1024)).toFixed(2)} MB`;
  } else {
    return '—';
  }
}

function penalty(run: types.Run): string {
  if (
    run.status == 'ready' &&
    run.verdict != 'JE' &&
    run.verdict != 'VE' &&
    run.verdict != 'CE'
  ) {
    return run.penalty.toFixed(2);
  }
  return '—';
}

function percentage(run: types.Run): string {
  if (
    run.status == 'ready' &&
    run.verdict != 'JE' &&
    run.verdict != 'VE' &&
    run.verdict != 'CE'
  ) {
    return `${(run.score * 100).toFixed(2)}%`;
  }
  return '—';
}

function points(run: types.Run): string {
  if (
    run.status == 'ready' &&
    run.verdict != 'JE' &&
    run.verdict != 'VE' &&
    run.verdict != 'CE' &&
    typeof run.contest_score !== 'undefined'
  ) {
    return run.contest_score.toFixed(2);
  }
  return '—';
}

function runtime(run: types.Run): string {
  if (
    run.status == 'ready' &&
    run.verdict != 'JE' &&
    run.verdict != 'VE' &&
    run.verdict != 'CE'
  ) {
    let prefix = '';
    if (run.verdict == 'TLE') {
      prefix = '>';
    }
    return `${prefix}${(run.runtime / 1000).toFixed(2)} s`;
  }
  return '—';
}

function showVerdictHelp(ev: Event): void {
  $(ev.target as HTMLElement).popover('show');
}

function statusClass(run: types.Run): string {
  if (run.status != 'ready') return '';
  if (run.type == 'disqualified') return 'status-disqualified';
  if (run.verdict == 'AC') {
    return 'status-ac';
  }
  if (run.verdict == 'TLE') {
    return 'status-tle';
  }
  if (run.verdict == 'MLE') {
    return 'status-mle';
  }
  if (run.verdict == 'WA') {
    return 'status-wa';
  }
  if (run.verdict == 'CE') {
    return 'status-ce';
  }
  if (run.verdict == 'JE' || run.verdict == 'VE') {
    return 'status-je-ve';
  }
  return '';
}

function status(run: types.Run): string {
  if (run.type == 'disqualified') return T.arenaRunsActionsDisqualified;
  return run.status == 'ready' ? run.verdict : run.status;
}

function statusHelp(run: types.Run): string {
  if (run.status != 'ready' || run.verdict == 'AC') {
    return '';
  }
  if (run.language == 'kj' || run.language == 'kp') {
    if (run.verdict == 'RTE' || run.verdict == 'RE') {
      return T.verdictHelpKarelRTE;
    } else if (run.verdict == 'TLE' || run.verdict == 'TO') {
      return T.verdictHelpKarelTLE;
    }
  }
  if (run.type == 'disqualified') return T.verdictHelpDisqualified;
  const verdict = T[`verdict${run.verdict}`];
  const verdictHelp = T[`verdictHelp${run.verdict}`];
  return `${verdict}: ${verdictHelp}`;
}

function onRunDetails(run: types.Run): void {
  emit('details', {
    guid: run.guid,
    isAdmin: true,
    hash: `#runs/all/show-run:${run.guid}`,
  });
  currentPopupDisplayed.value = PopupDisplayed.RunDetails;
}

function onPopupDismissed(): void {
  currentPopupDisplayed.value = PopupDisplayed.None;
  currentRunDetailsData.value = null;
  emit('reset-hash');
}

function onEmitFilterChanged({
  filter,
  value,
}: {
  filter: string;
  value: null | string;
}): void {
  filterOffset.value = 0;
  if (!value) {
    filters.value = filters.value.filter((item) => item.name !== filter);
    emit('filter-changed', { filter, value });
    return;
  }
  if (filter === 'contest') {
    filterContest.value = value;
  }
  const currentFilter = filters.value.find((item) => item.name === filter);
  if (!currentFilter) {
    filters.value.push({ name: filter, value: value });
  } else {
    currentFilter.value = value;
  }
  emit('filter-changed', { filter, value });
}

function onRemoveFilter(filter: string): void {
  if (filter === 'all') {
    filterLanguage.value = '';
    filterProblem.value = null;
    filterStatus.value = '';
    filterUsername.value = null;
    filterVerdict.value = '';
    filterContest.value = '';
    filterOffset.value = 0;
    filters.value = [];
    return;
  }
  switch (filter) {
    case 'language':
      filterLanguage.value = '';
      break;
    case 'problem':
      filterProblem.value = null;
      break;
    case 'status':
      filterStatus.value = '';
      break;
    case 'username':
      filterUsername.value = null;
      break;
    case 'verdict':
      filterVerdict.value = '';
      break;
    case 'contest':
      filterContest.value = '';
  }
  filters.value = filters.value.filter((item) => item.name !== filter);
}

function updateSearchResultUsers(query: string): void {
  if (props.problemsetProblems.length !== 0 && props.contestAlias) {
    emit('update-search-result-users-contest', {
      query,
      contestAlias: props.contestAlias,
    });
    return;
  }
  emit('update-search-result-users', { query });
}

function setFilterProblem(problemAlias: string): void {
  filterProblem.value = { key: problemAlias, value: problemAlias };
}

// Watchers
watch(
  () => props.runDetailsData,
  (newValue) => {
    currentRunDetailsData.value = newValue;
  },
);

watch(
  () => props.username,
  (newValue) => {
    if (!newValue) {
      filterUsername.value = null;
      return;
    }
    filterUsername.value = { key: newValue, value: newValue };
  },
);

watch(
  () => props.problemAlias,
  (newValue) => {
    if (!newValue) {
      filterProblem.value = null;
      return;
    }
    filterProblem.value = { key: newValue, value: newValue };
  },
);

watch(filterLanguage, (newValue) => {
  onEmitFilterChanged({ filter: 'language', value: newValue });
});

watch(filterOffset, (newValue) => {
  emit('filter-changed', { filter: 'offset', value: `${newValue}` });
});

watch(filterProblem, (newValue) => {
  if (!newValue) {
    onEmitFilterChanged({ filter: 'problem', value: null });
    return;
  }
  onEmitFilterChanged({ filter: 'problem', value: newValue.key });
});

watch(filterStatus, (newValue) => {
  onEmitFilterChanged({ filter: 'status', value: newValue });
});

watch(filterUsername, (newValue) => {
  if (!newValue) {
    onEmitFilterChanged({ filter: 'username', value: null });
    return;
  }
  onEmitFilterChanged({ filter: 'username', value: newValue.key });
});

watch(filterVerdict, (newValue) => {
  onEmitFilterChanged({ filter: 'verdict', value: newValue });
});
</script>

<style lang="scss" scoped>
@import '../../../../sass/main.scss';

.text-break-all {
  word-break: break-all;
}

.runs {
  border: 1px solid var(--arena-runs-table-border-color);
  margin-top: 2em;
}

.runs.filters {
  font-weight: bold;
  font-size: 1em;
  margin-bottom: 1em;
}

.runs td,
.runs th {
  border: 1px solid var(--arena-runs-table-td-border-color);
  border-width: 1px 0;
  text-align: center;
}

.runs tfoot td {
  a,
  button {
    display: block;
    padding: 0.5em;
    text-decoration: none;
    color: var(--arena-runs-table-tfoot-font-color);
    background: var(--arena-runs-table-tfoot-background-color);
    text-align: center;
  }

  a:hover,
  button:hover {
    background: var(--arena-runs-table-tfoot-background-color--hoover);
  }
}

.status-disqualified {
  background: var(--arena-runs-table-status-disqualified-background-color);
  color: var(--arena-runs-table-status-disqualified-font-color);
}
.status-je-ve {
  background: var(--arena-runs-table-status-je-ve-background-color);
  color: var(--arena-runs-table-status-je-ve-font-color);
}
.status-ac {
  background: var(--arena-runs-table-status-ac-background-color);
  color: var(--arena-runs-table-status-ac-font-color);
}
.status-wa {
  background: var(--arena-runs-table-status-wa-background-color);
  color: var(--arena-runs-table-status-ac-font-color);
}
.status-mle {
  background: var(--arena-runs-table-status-mle-background-color);
  color: var(--arena-runs-table-status-ac-font-color);
}
.status-tle {
  background: var(--arena-runs-table-status-tle-background-color);
  color: var(--arena-runs-table-status-ac-font-color);
}
.status-ce {
  background: var(--arena-runs-table-status-ce-background-color);
  color: var(--arena-runs-table-status-ce-font-color);
}
.status-pa {
  background: var(--arena-runs-table-status-pa-background-color);
  color: var(--arena-runs-table-status-ac-font-color);
}
.status-ole {
  background: var(--arena-runs-table-status-ole-background-color);
  color: var(--arena-runs-table-status-ac-font-color);
}
.status-rte {
  background: var(--arena-runs-table-status-rte-background-color);
  color: var(--arena-runs-table-status-ac-font-color);
}
.status-rfe {
  background: var(--arena-runs-table-status-rfe-background-color);
  color: var(--arena-runs-table-status-ac-font-color);
}
</style>
