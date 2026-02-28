<template>
  <div class="card" data-tab-clarifications>
    <h5 v-if="page && pageSize" class="card-header">
      {{
        ui.formatString(T.clarificationsRangeHeader, {
          lowCount: (page - 1) * pageSize + 1,
          highCount: page * pageSize,
        })
      }}
    </h5>
    <h5 v-else class="card-header">{{ T.wordsClarifications }}</h5>
    <div class="card-body">
      <slot name="new-clarification">
        <div v-if="problems.length" class="mb-3">
          <a
            href="#clarifications/all/new"
            data-new-clarification-button
            class="btn btn-primary"
            @click="currentPopupDisplayed = PopupDisplayed.NewClarification"
          >
            {{ T.wordsNewClarification }}
          </a>
          <OmegaupOverlay
            :show-overlay="currentPopupDisplayed !== PopupDisplayed.None"
            @hide-overlay="onPopupDismissed"
          >
            <template #popup>
              <OmegaupArenaNewClarificationPopup
                v-show="
                  currentPopupDisplayed === PopupDisplayed.NewClarification
                "
                :problems="problems"
                :users="users"
                :problem-alias="problemAlias"
                :username="username"
                @new-clarification="
                  (contestClarification) =>
                    emit('new-clarification', contestClarification)
                "
                @dismiss="onPopupDismissed"
              />
            </template>
          </OmegaupOverlay>
        </div>
      </slot>
      <div class="form-inline">
        <label v-if="allowFilterByAssignment">
          {{ T.wordsFilterByHomework }}
          <select
            v-model="selectedAssignment"
            class="form-control custom-select ml-1"
            name="problem"
          >
            <option
              v-for="assignmentName in assignmentsNames"
              :key="assignmentName"
              :value="assignmentName"
            >
              {{ assignmentName ? assignmentName : '' }}
            </option>
          </select>
        </label>
        <label :class="{ 'ml-md-4': allowFilterByAssignment }">
          {{ T.wordsFilterByProblem }}
          <select
            v-model="selectedProblem"
            class="form-control custom-select ml-1"
          >
            <option
              v-for="problemName in problemsNames"
              :key="problemName"
              :value="problemName"
            >
              {{ problemName }}
            </option>
          </select>
        </label>
      </div>
    </div>
    <div class="table-responsive">
      <table class="table mb-0">
        <thead>
          <tr class="text-nowrap">
            <th class="text-center" scope="col">{{ T.clarificationInfo }}</th>
            <th class="text-center" scope="col">{{ T.wordsMessage }}</th>
            <th class="text-center" scope="col">{{ T.wordsResult }}</th>
          </tr>
        </thead>
        <tbody>
          <OmegaupClarification
            v-for="clarification in filteredClarifications"
            :key="clarification.clarification_id"
            :is-admin="isAdmin"
            :selected="clarificationSelected(clarification.clarification_id)"
            :clarification="clarification"
            @clarification-response="
              (response) =>
                emit('clarification-response', {
                  ...response,
                  message: clarification.message,
                })
            "
          />
        </tbody>
      </table>
    </div>
    <div
      v-if="filteredClarifications.length === 0"
      class="empty-table-message py-2"
    >
      {{ T.clarificationsEmpty }}
    </div>
    <div v-if="pagerItems" class="card-footer">
      <OmegaupCommonPaginator :pager-items="pagerItems" />
    </div>
  </div>
</template>

<script lang="ts">
export enum PopupDisplayed {
  None,
  NewClarification,
}
</script>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import T from '../../lang';
import { types } from '../../api_types';
import * as ui from '../../ui';

import OmegaupClarification from './Clarification.vue';
import OmegaupArenaNewClarificationPopup from './NewClarificationPopup.vue';
import OmegaupOverlay from '../Overlay.vue';
import clarificationsStore from '../../arena/clarificationsStore';
import OmegaupCommonPaginator from '../common/Paginator.vue';

const props = withDefaults(
  defineProps<{
    isAdmin?: boolean;
    clarifications: types.Clarification[];
    problems?: types.NavbarProblemsetProblem[];
    users?: types.ContestUser[];
    popupDisplayed?: PopupDisplayed;
    problemAlias?: string | null;
    username?: string | null;
    showNewClarificationPopup?: boolean;
    allowFilterByAssignment?: boolean;
    pageSize?: number;
    page?: number;
    pagerItems?: types.PageItem[];
  }>(),
  {
    isAdmin: false,
    problems: () => [],
    users: () => [],
    popupDisplayed: PopupDisplayed.None,
    showNewClarificationPopup: false,
    allowFilterByAssignment: false,
  },
);

const emit = defineEmits<{
  (
    e: 'new-clarification',
    contestClarification: {
      clarification: types.Clarification;
      clearForm: () => void;
    },
  ): void;
  (e: 'clarification-response', response: types.Clarification): void;
  (e: 'update:activeTab', tab: string): void;
}>();

const currentPopupDisplayed = ref(props.popupDisplayed);
const selectedAssignment = ref<string | null>(null);
const selectedProblem = ref<string | null>(null);

const assignmentsNames = computed<Array<string | null>>(() => {
  return props.allowFilterByAssignment
    ? [
        ...new Set(
          props.clarifications.map(
            (clarification) => clarification.assignment_alias ?? null,
          ),
        ),
      ]
    : [];
});

const problemsNames = computed<string[]>(() => {
  return [
    ...new Set(
      props.clarifications.map((clarification) => clarification.problem_alias),
    ),
  ];
});

const filteredClarifications = computed<types.Clarification[]>(() => {
  return props.clarifications.filter(
    (clarification) =>
      (selectedAssignment.value === null ||
        clarification.assignment_alias === selectedAssignment.value) &&
      (selectedProblem.value === null ||
        clarification.problem_alias === selectedProblem.value),
  );
});

function onNewClarification(): void {
  currentPopupDisplayed.value = PopupDisplayed.NewClarification;
}

function onPopupDismissed(): void {
  currentPopupDisplayed.value = PopupDisplayed.None;
  emit('update:activeTab', 'clarifications');
}

function clarificationSelected(clarificationId: number): boolean {
  return clarificationsStore.state.selectedClarificationId === clarificationId;
}

watch(
  () => props.showNewClarificationPopup,
  (newValue: boolean) => {
    if (!newValue) {
      currentPopupDisplayed.value = PopupDisplayed.None;
      return;
    }
    currentPopupDisplayed.value = PopupDisplayed.NewClarification;
    onNewClarification();
  },
);

watch(
  () => props.popupDisplayed,
  (newValue: PopupDisplayed) => {
    currentPopupDisplayed.value = newValue;
    if (newValue === PopupDisplayed.None) return;
    if (newValue === PopupDisplayed.NewClarification) {
      onNewClarification();
    }
  },
);
</script>

<style lang="scss" scoped>
@import '../../../../sass/main.scss';
// :deep() allows child components to inherit the styles (see: https://vue-loader.vuejs.org/guide/scoped-css.html#deep-selectors)
:deep(pre) {
  display: block;
  padding: 0.5rem;
  font-size: 0.8rem;
  line-height: 1.42857143;
  color: var(--clarifications-list-pre-font-color);
  word-break: break-all;
  background-color: var(--clarifications-list-pre-background-color);
  border-radius: 4px;
}

a {
  background-color: var(--btn-ok-background-color) !important;
  color: var(--btn-ok-font-color) !important;

  /* stylelint-disable-next-line no-descending-specificity */
  &:hover {
    color: var(--btn-ok-font-color) !important;
    text-decoration: none !important;
  }
}
</style>
