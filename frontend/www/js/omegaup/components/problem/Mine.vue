<template>
  <div>
    <div
      v-if="privateProblemsAlert"
      class="alert alert-info alert-dismissible fade show"
      role="alert"
    >
      {{ T.messageMakeYourProblemsPublic }}
      <button
        type="button"
        class="close"
        data-dismiss="alert"
        aria-label="Close"
      >
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="card">
      <h5 class="card-header">{{ T.myproblemsListMyProblems }}</h5>
      <div class="card-body px-2 px-sm-4">
        <div class="row align-items-center mb-3">
          <div class="col-9 col-lg-6">
            <input
              v-model="currentQuery"
              class="typeahead form-control px-1 px-sm-3"
              :placeholder="T.wordsKeywordSearch"
            />
          </div>
          <a
            class="btn btn-primary"
            role="button"
            :class="{ disabled: currentQuery === '' }"
            :href="
              currentQuery
                ? `/problem/mine/?query=${encodeURIComponent(currentQuery)}`
                : ''
            "
            >{{ T.wordsSearch }}</a
          >
        </div>
        <div class="form-row">
          <div class="col">
            <div class="form-check">
              <label class="form-check-label">
                <input
                  v-model="shouldShowAllProblems"
                  class="form-check-input"
                  type="checkbox"
                  @change.prevent="
                    $emit('change-show-all-problems', shouldShowAllProblems)
                  "
                />
                <span>{{ statementShowAllProblems }}</span>
              </label>
            </div>
          </div>
        </div>
        <div class="row mt-3">
          <div class="col-8 col-md-6">
            <select
              v-model="allProblemsVisibilityOption"
              data-selected-problems
              class="custom-select pl-1 pl-sm-3"
            >
              <option selected value="-1">{{ T.forSelectedItems }}</option>
              <option value="1">{{ T.makePublic }}</option>
              <option value="0">{{ T.makePrivate }}</option>
              <option v-if="canDeleteSelectedProblems" value="2">
                {{ T.wordsDelete }}
              </option>
            </select>
          </div>
          <div class="col px-0">
            <button
              :disabled="allProblemsVisibilityOption === -1"
              data-visibility-action
              class="btn btn-primary"
              @click="onChangeVisibility"
            >
              {{ T.wordsConfirm }}
            </button>
          </div>
        </div>
      </div>
      <div class="table-responsive">
        <table class="table mb-0">
          <thead>
            <tr>
              <th scope="col" class="text-center"></th>
              <th scope="col" class="text-center">{{ T.wordsID }}</th>
              <th scope="col" class="text-center">{{ T.wordsTitle }}</th>
              <th scope="col" class="text-center">{{ T.wordsEdit }}</th>
              <th scope="col" class="text-center">{{ T.wordsStatistics }}</th>
              <th scope="col" class="text-center">{{ T.wordsDelete }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="problem in problems" :key="problem.alias">
              <td class="align-middle">
                <input
                  v-model="selectedProblems"
                  type="checkbox"
                  :disabled="problem.visibility === -10"
                  :data-selected-problem="problem.alias"
                  :value="problem"
                />
              </td>
              <td class="text-right align-middle">
                {{ problem.problem_id }}
              </td>
              <td class="d-flex align-items-center">
                <div class="d-inline-block ml-2">
                  <a class="mr-1" :href="`/arena/problem/${problem.alias}/`">{{
                    problem.title
                  }}</a>
                  <font-awesome-icon
                    v-if="
                      problem.visibility ==
                        visibilityStatuses['publicWarning'] ||
                      problem.visibility == visibilityStatuses['privateWarning']
                    "
                    :title="T.wordsWarningProblem"
                    :icon="['fas', 'exclamation-triangle']"
                  />
                  <font-awesome-icon
                    v-else-if="
                      problem.visibility ==
                        visibilityStatuses['publicBanned'] ||
                      problem.visibility == visibilityStatuses['privateBanned']
                    "
                    :title="T.wordsBannedProblem"
                    :icon="['fas', 'ban']"
                  />
                  <font-awesome-icon
                    v-if="problem.visibility === visibilityStatuses['deleted']"
                    :title="T.wordsDeleted"
                    :icon="['fas', 'trash']"
                  />
                  <font-awesome-icon
                    v-else-if="
                      (problem.visibility <=
                        visibilityStatuses['privateBanned'] ||
                        problem.visibility ==
                          visibilityStatuses['privateWarning'] ||
                        problem.visibility == visibilityStatuses['private']) &&
                      problem.visibility > visibilityStatuses['deleted']
                    "
                    :title="T.wordsPrivate"
                    :icon="['fas', 'eye-slash']"
                  />
                  <div v-if="problem.tags.length" class="tags-badges">
                    <a
                      v-for="tag in problem.tags"
                      :key="tag.name"
                      class="badge custom-badge m-1 p-1 p-lg-2"
                      :class="[
                        {
                          'custom-badge-quality': tag.name.includes(
                            'problemLevel',
                          ),
                        },
                        `custom-badge-${
                          tag.source.includes('quality') ? 'owner' : tag.source
                        }`,
                      ]"
                      :href="`/problem/?tag[]=${tag.name}`"
                      >{{
                        Object.prototype.hasOwnProperty.call(T, tag.name)
                          ? T[tag.name]
                          : tag.name
                      }}</a
                    >
                  </div>
                </div>
              </td>
              <td class="text-center align-middle">
                <a :href="`/problem/${problem.alias}/edit/`">
                  <font-awesome-icon :icon="['fas', 'edit']" />
                </a>
              </td>
              <td class="text-center align-middle">
                <a :href="`/problem/${problem.alias}/stats/`">
                  <font-awesome-icon :icon="['fas', 'chart-bar']" />
                </a>
              </td>
              <td class="text-center align-middle">
                <button
                  v-if="problemCanBeDeleted(problem)"
                  :data-delete-problem="problem.alias"
                  class="btn btn-danger"
                  @click.prevent="toggleConfirmationModal(problem.alias)"
                >
                  <font-awesome-icon :icon="['fas', 'trash']" />
                </button>
              </td>
              <b-modal
                v-if="problemCanBeDeleted(problem)"
                v-model="confirmationModal[problem.alias]"
                :title="
                  ui.formatString(T.problemEditDeleteRequireConfirmation, {
                    problemAlias: problem.alias,
                  })
                "
                :ok-title="T.problemEditDeleteOk"
                ok-variant="danger"
                :cancel-title="T.problemEditDeleteCancel"
                @ok="
                  $emit('remove', {
                    alias: problem.alias,
                    shouldShowAllProblems,
                  })
                "
              >
                <p>{{ T.problemEditDeleteConfirmationMessage }}</p>
              </b-modal>
            </tr>
          </tbody>
        </table>
      </div>
      <b-modal
        v-model="showConfirmationModalDeleteAll"
        :title="T.problemEditDeleteSelectedProblemsRequireConfirmation"
        :ok-title="T.problemEditDeleteOk"
        ok-variant="danger"
        :cancel-title="T.problemEditDeleteCancel"
        @ok="
          $emit('remove-all-problems', {
            selectedProblems,
            shouldShowAllProblems,
          });
          selectedProblems = [];
          allProblemsVisibilityOption = -1;
        "
      >
        <p>{{ T.problemEditDeleteSelectedProblemsConfirmationMessage }}</p>
      </b-modal>
      <div class="card-footer">
        <omegaup-common-paginator
          :pager-items="pagerItems"
          @page-changed="(page) => $emit('go-to-page', page)"
        ></omegaup-common-paginator>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, reactive, PropType } from 'vue';
import T from '../../lang';
import { types } from '../../api_types';
import common_Paginator from '../common/Paginator.vue';
import * as ui from '../../ui';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { BModal } from 'bootstrap-vue-next';
import {
  faEyeSlash,
  faTrash,
  faEdit,
  faChartBar,
  faExclamationTriangle,
  faBan,
} from '@fortawesome/free-solid-svg-icons';
library.add(
  faEyeSlash,
  faTrash,
  faEdit,
  faChartBar,
  faExclamationTriangle,
  faBan,
);

export default defineComponent({
  name: 'ProblemMine',
  components: {
    FontAwesomeIcon,
    'omegaup-common-paginator': common_Paginator,
  },
  props: {
    problems: { type: Array as PropType<types.ProblemListItem[]>, required: true },
    pagerItems: { type: Array as PropType<types.PageItem[]>, required: true },
    privateProblemsAlert: { type: Boolean, required: true },
    isSysadmin: { type: Boolean, required: true },
    visibilityStatuses: { type: Object as PropType<Record<string, number>>, required: true },
    query: { type: String as PropType<string | null>, default: null },
  },
  emits: ['change-show-all-problems', 'remove', 'remove-all-problems', 'change-visibility', 'go-to-page'],
  setup(props, { emit }) {
    const currentQuery = ref(props.query ?? '');
    const shouldShowAllProblems = ref(false);
    const selectedProblems = ref<types.ProblemListItem[]>([]);
    const allProblemsVisibilityOption = ref(-1);
    const confirmationModal = reactive<Record<string, boolean>>({});
    const showConfirmationModalDeleteAll = ref(false);

    const statementShowAllProblems = computed(() => {
      return props.isSysadmin
        ? T.problemListShowAdminProblemsAndDeleted
        : T.problemListShowAdminProblems;
    });

    const canDeleteSelectedProblems = computed(() => {
      if (!selectedProblems.value.length) return false;
      return selectedProblems.value.every(
        (problem) => problem.can_be_removed === true,
      );
    });

    function problemCanBeDeleted(problem: types.ProblemListItem): boolean {
      return (
        problem.can_be_removed === true &&
        problem.visibility !== props.visibilityStatuses['deleted']
      );
    }

    function toggleConfirmationModal(problemAlias: string): void {
      confirmationModal[problemAlias] = !confirmationModal[problemAlias];
    }

    function onChangeVisibility(): void {
      if (!selectedProblems.value.length) {
        return;
      }

      if (allProblemsVisibilityOption.value == 2) {
        showConfirmationModalDeleteAll.value = true;
        return;
      }

      emit(
        'change-visibility',
        selectedProblems.value,
        allProblemsVisibilityOption.value,
      );
      selectedProblems.value = [];
      allProblemsVisibilityOption.value = -1;
    }

    return {
      T,
      ui,
      currentQuery,
      shouldShowAllProblems,
      selectedProblems,
      allProblemsVisibilityOption,
      confirmationModal,
      showConfirmationModalDeleteAll,
      statementShowAllProblems,
      canDeleteSelectedProblems,
      problemCanBeDeleted,
      toggleConfirmationModal,
      onChangeVisibility,
    };
  },
});
</script>
