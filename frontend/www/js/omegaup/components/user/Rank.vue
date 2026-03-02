<template>
  <div class="card" data-user-rank>
    <h5 class="card-header d-flex justify-content-between align-items-center">
      {{
        isIndex
          ? ui.formatString(T.userRankOfTheMonthHeader, {
              count: length,
            })
          : ui.formatString(T.rankRangeHeader, {
              lowCount: (page - 1) * length + 1,
              highCount: page * length,
            })
      }}

      <a :href="UserRankingFeatureGuideURL"
        ><font-awesome-icon :icon="['fas', 'question-circle']" />
        {{ T.wordsRankingMeasurement }}</a
      >
    </h5>
    <div v-if="!isIndex" class="card-body">
      <div class="form-row mb-2">
        <omegaup-common-typeahead
          class="col col-md-4 pl-0 pr-2"
          :existing-options="searchResultUsers"
          v-model:value="searchedUsername"
          :max-results="10"
          @update-existing-options="
            (query) => $emit('update-search-result-users', query)
          "
        ></omegaup-common-typeahead>
        <button
          class="btn btn-primary form-control col-4 col-md-2 mr-0 mr-md-2"
          type="button"
          @click="onSubmit"
        >
          {{ T.searchUser }}
        </button>
        <template v-if="Object.keys(availableFilters).length > 0">
          <select
            v-model="currentFilter"
            class="filter form-control col-12 col-md-4 mt-2 mt-md-0"
          >
            <option value="">
              {{ T.wordsSelectFilter }}
            </option>
            <option
              v-for="(item, key, index) in availableFilters"
              :key="index"
              :value="key"
            >
              {{ item }}
            </option>
          </select>
        </template>
      </div>
      <div class="d-flex flex-wrap align-items-center">
        <template v-if="!isSelectionMode">
          <a
            href="/rank/compare/"
            class="btn btn-outline-primary btn-sm mr-2 mb-2 d-flex align-items-center"
          >
            <font-awesome-icon :icon="['fas', 'exchange-alt']" class="mr-1" />
            {{ T.compareUsersTitle }}
          </a>
          <button
            class="btn btn-outline-secondary btn-sm mr-2 mb-2 d-flex align-items-center"
            @click="isSelectionMode = true"
          >
            <font-awesome-icon :icon="['fas', 'check-square']" class="mr-1" />
            {{ T.selectTwoUsersToCompare }}
          </button>
        </template>
        <template v-else>
          <button
            class="btn btn-outline-secondary btn-sm mr-2 mb-2 d-flex align-items-center"
            @click="cancelSelection"
          >
            <font-awesome-icon :icon="['fas', 'times']" class="mr-1" />
            {{ T.wordsCancel }}
          </button>
          <button
            class="btn btn-primary btn-sm mr-2 mb-2 d-flex align-items-center"
            :disabled="selectedUsers.length !== 2"
            @click="compareSelectedUsers"
          >
            <font-awesome-icon :icon="['fas', 'exchange-alt']" class="mr-1" />
            {{ T.compareUsersTitle }}
          </button>
          <button
            v-if="selectedUsers.length === 1 && currentUsername"
            class="btn btn-outline-primary btn-sm mr-2 mb-2 d-flex align-items-center"
            @click="compareVsMe"
          >
            <font-awesome-icon :icon="['fas', 'user']" class="mr-1" />
            {{ T.compareVsMe }}
          </button>
        </template>
      </div>
    </div>
    <div v-if="ranking.length === 0" class="empty-category text-center m-4">
      <h2>{{ T.userRankEmptyList }}</h2>
    </div>
    <div v-else>
      <p class="text-right mr-3 mb-2 text-muted">{{ lastUpdatedText }}</p>
      <table class="table mb-0 table-responsive-sm">
        <thead>
          <tr>
            <th
              v-if="isSelectionMode"
              scope="col"
              class="text-center align-middle selection-column"
            >
              {{ T.wordsSelect }}
            </th>
            <th scope="col" class="pl-4 column-width align-middle">#</th>
            <th scope="col" class="align-middle">{{ T.contestParticipant }}</th>
            <th scope="col" class="text-right align-middle">
              {{ T.rankScore }}
            </th>
            <th
              v-if="!isIndex"
              scope="col"
              class="text-right pr-4 align-middle"
            >
              {{ T.rankSolved }}
              <!-- id-lint off -->
              <b-button
                id="popover-solved-problems"
                class="ml-1"
                size="sm"
                variant="none"
                @click="showPopover = !showPopover"
              >
                <font-awesome-icon :icon="['fas', 'question-circle']" />
              </b-button>
              <!-- id-lint on -->
              <b-popover
                v-model:show="showPopover"
                target="popover-solved-problems"
                placement="right"
              >
                {{ T.userRankSolvedProblemsHelp }}
              </b-popover>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(user, index) in ranking" :key="index">
            <td v-if="isSelectionMode" class="text-center">
              <input
                type="checkbox"
                :aria-label="
                  ui.formatString(T.selectUserForComparison, {
                    username: user.username,
                  })
                "
                :aria-checked="isUserSelected(user.username)"
                :checked="isUserSelected(user.username)"
                :disabled="
                  !isUserSelected(user.username) && selectedUsers.length >= 2
                "
                @change="toggleUserSelection(user.username)"
              />
            </td>
            <th scope="row" class="pl-4 column-width">{{ user.rank }}</th>
            <td>
              <omegaup-countryflag
                :country="user.country"
              ></omegaup-countryflag>
              <omegaup-user-username
                :classname="user.classname"
                :linkify="true"
                :username="user.username"
              ></omegaup-user-username>
              <span v-if="user.name && length !== 5"
                ><br />
                {{ user.name }}</span
              >
            </td>
            <td class="text-right">{{ user.score.toFixed(2) }}</td>
            <td v-if="!isIndex" class="text-right pr-4">
              {{ user.problems_solved }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="isIndex" class="card-footer">
      <a href="/rank/">{{ T.rankSeeGeneralRanking }}</a>
    </div>
    <div v-else class="card-footer">
      <omegaup-common-paginator
        :pager-items="pagerItems"
      ></omegaup-common-paginator>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, PropType } from 'vue';

import { types } from '../../api_types';
import T from '../../lang';
import * as time from '../../time';
import * as ui from '../../ui';
import common_Paginator from '../common/Paginator.vue';
import common_Typeahead from '../common/Typeahead.vue';
import CountryFlag from '../CountryFlag.vue';
import user_Username from '../user/Username.vue';

import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faCheckSquare,
  faExchangeAlt,
  faQuestionCircle,
  faTimes,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
library.add(faCheckSquare, faExchangeAlt, faQuestionCircle, faTimes, faUser);

import { getBlogUrl } from '../../urlHelper';

// Import Bootstrap and BootstrapVue CSS files (order is important: base before overrides)
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css';
import 'bootstrap/dist/css/bootstrap.css';
import { BButton, BPopover } from 'bootstrap-vue-next';
interface Rank {
  country: string;
  classname?: string;
  username: string;
  name?: string;
  score: number;
  problemsSolvedUser: number;
}

export default defineComponent({
  name: 'UserRank',
  components: {
    FontAwesomeIcon,
    'omegaup-common-typeahead': common_Typeahead,
    'omegaup-countryflag': CountryFlag,
    'omegaup-user-username': user_Username,
    'omegaup-common-paginator': common_Paginator,
  },
  props: {
    page: {
      type: Number,
      required: true,
    },
    length: {
      type: Number,
      required: true,
    },
    isIndex: {
      type: Boolean,
      default: false,
    },
    isLogged: {
      type: Boolean,
      required: true,
    },
    availableFilters: {
      type: Object as PropType<{ [key: string]: string }>,
      default: () => ({}),
    },
    filter: {
      type: String as PropType<string | null>,
      default: null,
    },
    ranking: {
      type: Array as PropType<Rank[]>,
      required: true,
    },
    lastUpdated: {
      type: Date as PropType<Date>,
      required: true,
    },
    resultTotal: {
      type: Number,
      required: true,
    },
    pagerItems: {
      type: Array as PropType<types.PageItem[]>,
      required: true,
    },
    searchResultUsers: {
      type: Array as PropType<types.ListItem[]>,
      required: true,
    },
    currentUsername: {
      type: String,
      default: '',
    },
  },
  emits: ['update-search-result-users'],
  setup(props) {
    const searchedUsername = ref<null | types.ListItem>(null);
    const showPopover = ref(false);
    const currentFilter = ref(props.filter);
    const isSelectionMode = ref(false);
    const selectedUsers = ref<string[]>([]);

    const UserRankingFeatureGuideURL = computed((): string => {
      return getBlogUrl('UserRankingFeatureGuideURL');
    });

    const lastUpdatedText = computed((): null | string => {
      if (!props.lastUpdated) {
        return null;
      }
      return ui.formatString(T.userRankLastUpdated, {
        datetime: time.formatDateLocalHHMM(props.lastUpdated),
      });
    });

    function onSubmit(): void {
      if (!searchedUsername.value) return;
      window.location.href = `/profile/${encodeURIComponent(
        searchedUsername.value.key,
      )}`;
    }

    watch(currentFilter, (newFilter: string | null): void => {
      // change url parameters with jquery
      // https://samaxes.com/2011/09/change-url-parameters-with-jquery/
      let queryParameters: { [key: string]: string } = {};
      const re = /([^&=]+)=([^&]*)/g;
      const queryString = location.search.substring(1);
      let m: string[] | null = null;
      while ((m = re.exec(queryString))) {
        queryParameters[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
      }
      if (newFilter !== '' && newFilter !== null) {
        queryParameters['filter'] = newFilter;
        // When a filter is selected, the parameter 'page' must be reset.
        delete queryParameters['page'];
      } else {
        delete queryParameters['filter'];
      }
      window.location.search = ui.buildURLQuery(queryParameters);
    });

    function toggleUserSelection(username: string): void {
      const index = selectedUsers.value.indexOf(username);
      if (index > -1) {
        selectedUsers.value.splice(index, 1);
      } else if (selectedUsers.value.length < 2) {
        selectedUsers.value.push(username);
      }
    }

    function isUserSelected(username: string): boolean {
      return selectedUsers.value.includes(username);
    }

    function cancelSelection(): void {
      isSelectionMode.value = false;
      selectedUsers.value = [];
    }

    function compareSelectedUsers(): void {
      if (selectedUsers.value.length === 2) {
        window.location.href = `/rank/compare/?username1=${encodeURIComponent(
          selectedUsers.value[0],
        )}&username2=${encodeURIComponent(selectedUsers.value[1])}`;
      }
    }

    function compareVsMe(): void {
      if (selectedUsers.value.length === 1 && props.currentUsername) {
        window.location.href = `/rank/compare/?username1=${encodeURIComponent(
          selectedUsers.value[0],
        )}&username2=${encodeURIComponent(props.currentUsername)}`;
      }
    }

    const nextPageFilter = computed((): string => {
      if (currentFilter.value)
        return `/rank?page=${props.page + 1}&filter=${encodeURIComponent(
          currentFilter.value,
        )}`;
      else return `/rank?page=${props.page + 1}`;
    });

    const prevPageFilter = computed((): string => {
      if (currentFilter.value)
        return `/rank?page=${props.page - 1}&filter=${encodeURIComponent(
          currentFilter.value,
        )}`;
      else return `/rank?page=${props.page - 1}`;
    });

    return {
      T,
      ui,
      searchedUsername,
      showPopover,
      currentFilter,
      isSelectionMode,
      selectedUsers,
      UserRankingFeatureGuideURL,
      lastUpdatedText,
      onSubmit,
      toggleUserSelection,
      isUserSelected,
      cancelSelection,
      compareSelectedUsers,
      compareVsMe,
      nextPageFilter,
      prevPageFilter,
    };
  },
});
</script>

<style lang="scss">
@import '../../../../sass/main.scss';
.empty-category {
  color: var(--arena-contest-list-empty-category-font-color);
}

[data-user-rank] .tags-input-wrapper-default {
  padding: 0.35rem 0.25rem 0.7rem 0.25rem;
  overflow: hidden;
}

[data-user-rank] {
  max-width: 52rem;
  margin: 0 auto;
}

.column-width {
  max-width: 4rem;
}

.selection-column {
  width: 40px;
  font-size: 0.75rem;
}
</style>
