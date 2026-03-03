<template>
  <div>
    <div class="col-sm-12">
      <h1 class="title">{{ T.wordsContests }}</h1>
    </div>

    <!-- Search and Filter Section -->
    <b-card class="mb-4">
      <b-container>
        <b-row class="justify-content-between" align-v="center">
          <b-col class="col-12 col-md-5 mb-2 mb-md-0 p-0">
            <form @submit.prevent="onSearchQuery">
              <div class="input-group">
                <input
                  v-model="currentQuery"
                  class="form-control nav-link"
                  type="text"
                  name="query"
                  autocomplete="off"
                  autocorrect="off"
                  autocapitalize="off"
                  spellcheck="false"
                  :placeholder="T.wordsKeyword"
                  @input="onSearchQueryDebounced"
                  @keyup.enter="onSearchQuery"
                />
                <button
                  class="btn reset-btn nav-link"
                  type="reset"
                  @click="onReset"
                >
                  &times;
                </button>
                <div class="input-group-append">
                  <input
                    class="btn btn-primary btn-style btn-md btn-block active nav-link"
                    type="submit"
                    :value="T.wordsSearch"
                  />
                </div>
              </div>
            </form>
          </b-col>
          <b-col sm="12" class="d-flex col-md-6 btns-group p-0">
            <b-dropdown ref="dropdownOrderBy" no-caret data-dropdown-order>
              <template #button-content>
                <div>
                  <font-awesome-icon icon="sort-amount-down" />
                  {{ T.contestOrderBy }}
                </div>
              </template>
              <b-dropdown-item href="#" data-order-by-ends @click="orderByEnds">
                <font-awesome-icon
                  v-if="currentOrder === ContestOrder.Ends"
                  icon="check"
                  class="mr-1"
                />{{ T.contestOrderByEnds }}</b-dropdown-item
              >
              <b-dropdown-item
                href="#"
                data-order-by-title
                @click="orderByTitle"
              >
                <font-awesome-icon
                  v-if="currentOrder === ContestOrder.Title"
                  icon="check"
                  class="mr-1"
                />{{ T.contestOrderByTitle }}</b-dropdown-item
              >
              <b-dropdown-item
                href="#"
                data-order-by-duration
                @click="orderByDuration"
              >
                <font-awesome-icon
                  v-if="currentOrder === ContestOrder.Duration"
                  icon="check"
                  class="mr-1"
                />{{ T.contestOrderByDuration }}</b-dropdown-item
              >
              <b-dropdown-item
                href="#"
                data-order-by-organizer
                @click="orderByOrganizer"
              >
                <font-awesome-icon
                  v-if="currentOrder === ContestOrder.Organizer"
                  icon="check"
                  class="mr-1"
                />{{ T.contestOrderByOrganizer }}</b-dropdown-item
              >
              <b-dropdown-item
                href="#"
                data-order-by-contestants
                @click="orderByContestants"
              >
                <font-awesome-icon
                  v-if="currentOrder === ContestOrder.Contestants"
                  icon="check"
                  class="mr-1"
                />{{ T.contestOrderByContestants }}</b-dropdown-item
              >
              <b-dropdown-item
                href="#"
                data-order-by-signed-up
                @click="orderBySignedUp"
              >
                <font-awesome-icon
                  v-if="currentOrder === ContestOrder.SignedUp"
                  icon="check"
                  class="mr-1"
                />{{ T.contestOrderBySignedUp }}</b-dropdown-item
              >
            </b-dropdown>
            <b-dropdown
              ref="dropdownFilterBy"
              class="mr-0"
              no-caret
              data-dropdown-filter
            >
              <template #button-content>
                <font-awesome-icon icon="filter" />
                {{ T.contestFilterBy }}
              </template>
              <b-dropdown-item href="#" data-filter-by-all @click="filterByAll">
                <font-awesome-icon
                  v-if="currentFilter === ContestFilter.All"
                  icon="check"
                  class="mr-1"
                />{{ T.contestFilterByAll }}</b-dropdown-item
              >
              <b-dropdown-item
                href="#"
                data-filter-by-signed-up
                @click="filterBySignedUp"
              >
                <font-awesome-icon
                  v-if="currentFilter === ContestFilter.SignedUp"
                  icon="check"
                  class="mr-1"
                />{{ T.contestFilterBySignedUp }}</b-dropdown-item
              >
              <b-dropdown-item
                href="#"
                data-filter-by-recommended
                @click="filterByRecommended"
              >
                <font-awesome-icon
                  v-if="currentFilter === ContestFilter.OnlyRecommended"
                  icon="check"
                  class="mr-1"
                />{{ T.contestFilterByRecommended }}</b-dropdown-item
              >
            </b-dropdown>
          </b-col>
        </b-row>
      </b-container>
    </b-card>

    <!-- Summary View (Horizontal Scrolling) -->
    <div v-if="!viewAllCategory">
      <div
        v-for="(tab, index) in [
          ContestTab.Current,
          ContestTab.Future,
          ContestTab.Past,
        ]"
        :key="tab"
        class="mb-5 section-container"
        :class="{ 'section-separator': index < 2 }"
      >
        <div
          class="d-flex justify-content-between align-items-center mb-3 px-3"
        >
          <h3 class="m-0">{{ getTabTitle(tab) }}</h3>
          <b-button
            v-if="getContestsForTab(tab).length > 0"
            variant="link"
            @click="setViewAll(tab)"
          >
            {{ T.wordsViewAll }}
          </b-button>
        </div>

        <div class="position-relative scroll-wrapper">
          <b-button
            v-if="canScrollLeft(tab)"
            variant="light"
            class="scroll-btn scroll-left shadow-sm"
            @click="scrollLeft(tab)"
          >
            <font-awesome-icon icon="chevron-left" />
          </b-button>

          <div
            :ref="`scrollContainer_${tab}`"
            class="horizontal-scroll-container px-3 pb-3"
            @scroll="onScroll(tab)"
          >
            <div
              v-if="getContestsForTab(tab).length === 0"
              class="text-muted font-italic ml-3"
            >
              {{ T.contestListEmpty }}
            </div>
            <div v-else class="d-flex">
              <div
                v-for="contestItem in getContestsForTab(tab).slice(0, 10)"
                :key="contestItem.contest_id"
                class="mr-3"
                style="min-width: 300px; max-width: 300px"
              >
                <omegaup-contest-card :contest="contestItem">
                  <!-- Slots -->
                  <template #contest-button-scoreboard>
                    <div
                      v-if="
                        tab === ContestTab.Current || tab === ContestTab.Future
                      "
                    ></div>
                  </template>

                  <template #text-contest-date>
                    <b-card-text v-if="tab === ContestTab.Current">
                      <font-awesome-icon icon="calendar-alt" />
                      <a :href="getTimeLink(contestItem.finish_time)">
                        {{
                          ui.formatString(T.contestEndTime, {
                            endDate: finishContestDate(contestItem),
                          })
                        }}
                      </a>
                    </b-card-text>
                    <b-card-text v-else-if="tab === ContestTab.Future">
                      <font-awesome-icon icon="calendar-alt" />
                      <a :href="getTimeLink(contestItem.start_time)">
                        {{
                          ui.formatString(T.contestStartTime, {
                            startDate: startContestDate(contestItem),
                          })
                        }}
                      </a>
                    </b-card-text>
                    <b-card-text v-else-if="tab === ContestTab.Past">
                      <font-awesome-icon icon="calendar-alt" />
                      <a :href="getTimeLink(contestItem.start_time)">
                        {{
                          ui.formatString(T.contestStartedTime, {
                            startedDate: startContestDate(contestItem),
                          })
                        }}
                      </a>
                    </b-card-text>
                  </template>

                  <template #contest-dropdown>
                    <div
                      v-if="
                        tab === ContestTab.Current || tab === ContestTab.Future
                      "
                    ></div>
                  </template>

                  <template #contest-button-enter>
                    <div
                      v-if="
                        tab === ContestTab.Future || tab === ContestTab.Past
                      "
                    ></div>
                  </template>

                  <template #contest-enroll-status>
                    <div v-if="tab === ContestTab.Past"></div>
                  </template>

                  <template #contest-button-see-details>
                    <div v-if="tab === ContestTab.Past"></div>
                  </template>
                </omegaup-contest-card>
              </div>
            </div>
          </div>

          <b-button
            v-if="canScrollRight(tab)"
            variant="light"
            class="scroll-btn scroll-right shadow-sm"
            @click="scrollRight(tab)"
          >
            <font-awesome-icon icon="chevron-right" />
          </b-button>
        </div>
      </div>
    </div>

    <!-- Full Grid View -->
    <div v-else>
      <div class="d-flex align-items-center mb-4 px-3">
        <b-button
          variant="outline-secondary"
          class="mr-3"
          :title="T.wordsBack"
          @click="setViewAll(null)"
        >
          <font-awesome-icon icon="arrow-left" />
        </b-button>
        <h2 class="m-0">{{ getTabTitle(viewAllCategory) }}</h2>
      </div>

      <template v-if="loading || refreshing">
        <b-row>
          <b-col
            v-for="index in 6"
            :key="`skeleton-${index}`"
            cols="12"
            md="6"
            lg="4"
            class="mb-4"
          >
            <omegaup-contest-skeleton></omegaup-contest-skeleton>
          </b-col>
        </b-row>
      </template>
      <div v-else-if="contestListEmpty" class="empty-category">
        {{ T.contestListEmpty }}
      </div>
      <template v-else>
        <b-row>
          <b-col
            v-for="contestItem in contestList"
            :key="contestItem.contest_id"
            cols="12"
            md="6"
            lg="4"
            class="mb-4"
          >
            <omegaup-contest-card :contest="contestItem">
              <!-- Slots -->
              <template #contest-button-scoreboard>
                <div
                  v-if="
                    viewAllCategory === ContestTab.Current ||
                    viewAllCategory === ContestTab.Future
                  "
                ></div>
              </template>

              <template #text-contest-date>
                <b-card-text v-if="viewAllCategory === ContestTab.Current">
                  <font-awesome-icon icon="calendar-alt" />
                  <a :href="getTimeLink(contestItem.finish_time)">
                    {{
                      ui.formatString(T.contestEndTime, {
                        endDate: finishContestDate(contestItem),
                      })
                    }}
                  </a>
                </b-card-text>
                <b-card-text v-else-if="viewAllCategory === ContestTab.Future">
                  <font-awesome-icon icon="calendar-alt" />
                  <a :href="getTimeLink(contestItem.start_time)">
                    {{
                      ui.formatString(T.contestStartTime, {
                        startDate: startContestDate(contestItem),
                      })
                    }}
                  </a>
                </b-card-text>
                <b-card-text v-else-if="viewAllCategory === ContestTab.Past">
                  <font-awesome-icon icon="calendar-alt" />
                  <a :href="getTimeLink(contestItem.start_time)">
                    {{
                      ui.formatString(T.contestStartedTime, {
                        startedDate: startContestDate(contestItem),
                      })
                    }}
                  </a>
                </b-card-text>
              </template>

              <template #contest-dropdown>
                <div
                  v-if="
                    viewAllCategory === ContestTab.Current ||
                    viewAllCategory === ContestTab.Future
                  "
                ></div>
              </template>

              <template #contest-button-enter>
                <div
                  v-if="
                    viewAllCategory === ContestTab.Future ||
                    viewAllCategory === ContestTab.Past
                  "
                ></div>
              </template>

              <template #contest-enroll-status>
                <div v-if="viewAllCategory === ContestTab.Past"></div>
              </template>

              <template #contest-button-see-details>
                <div v-if="viewAllCategory === ContestTab.Past"></div>
              </template>
            </omegaup-contest-card>
          </b-col>
        </b-row>
      </template>

      <div
        v-if="
          !loading &&
          !contestListEmpty &&
          hasMore &&
          contestList.length > showMoreThreshold
        "
        class="text-center mb-2"
      >
        <button
          class="btn btn-outline-primary w-100"
          :disabled="isScrollLoading"
          @click="loadMoreContests"
        >
          {{ showMoreContestButtonText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onMounted, onBeforeUnmount, PropType } from 'vue';
import { types } from '../../api_types';
import * as time from '../../time';
import T from '../../lang';
import { getExternalUrl } from '../../urlHelper';

// Import Bootstrap an BootstrapVue CSS files (order is important)
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css';
import { BCard, BCol, BContainer, BDropdown, BRow, BTabs } from 'bootstrap-vue-next';
import 'bootstrap/dist/css/bootstrap.css';

// Import Only Required Plugins
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import ContestCard from './ContestCard.vue';
import ContestSkeleton from './ContestSkeleton.vue';
library.add(fas);

export enum ContestTab {
  Current = 'current',
  Future = 'future',
  Past = 'past',
}

export enum ContestOrder {
  None = 'none',
  Title = 'title',
  Ends = 'ends',
  Duration = 'duration',
  Organizer = 'organizer',
  Contestants = 'contestants',
  SignedUp = 'signedup',
}

export enum ContestFilter {
  SignedUp = 'signedup',
  OnlyRecommended = 'recommended',
  All = 'all',
}

export interface UrlParams {
  page: number;
  tab_name: ContestTab;
  query: string;
  sort_order: ContestOrder;
  filter: ContestFilter;
  replaceState?: boolean; // When true, use replaceState instead of pushState (for browser navigation)
}

export default defineComponent({
  name: 'ArenaContestList',
  components: {
    'omegaup-contest-card': ContestCard,
    'omegaup-contest-skeleton': ContestSkeleton,
    FontAwesomeIcon,
  },
  props: {
    countContests: {
      type: Object as PropType<{ [key: string]: number } | null>,
      default: null,
    },
    contests: {
      type: Object as PropType<types.ContestList>,
      required: true,
    },
    query: {
      type: String,
      required: true,
    },
    tab: {
      type: String as PropType<ContestTab>,
      required: true,
    },
    sortOrder: {
      type: String as PropType<ContestOrder>,
      default: ContestOrder.None,
    },
    filter: {
      type: String as PropType<ContestFilter>,
      default: ContestFilter.All,
    },
    page: {
      type: Number,
      required: true,
    },
    pageSize: {
      type: Number,
      default: 10,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['fetch-page'],
  setup(props, { emit }) {
    const currentTab = ref<ContestTab>(props.tab);
    const currentQuery = ref(props.query);
    const currentOrder = ref<ContestOrder>(props.sortOrder);
    const currentFilter = ref<ContestFilter>(props.filter);
    const currentPage = ref(props.page);
    const refreshing = ref(false);
    const isScrollLoading = ref(false);
    const hasMore = ref(true);
    // Flag to track if state change came from browser navigation (back/forward button)
    // When true, we should use replaceState instead of pushState to avoid corrupting history
    const isFromBrowserNavigation = ref(false);
    // Flag to track the very first load — initial URL normalization should use
    // replaceState to avoid creating an extra history entry (see issue #9161)
    const isInitialLoad = ref(true);

    function titleLinkClass(tab: ContestTab) {
      if (currentTab.value === tab) {
        return ['text-center', 'active-title-link'];
      } else {
        return ['text-center', 'title-link'];
      }
    }

    function onSearchQuery() {
      const urlObj = new URL(window.location.href);
      const params: UrlParams = {
        page: 1,
        tab_name: currentTab.value,
        query: currentQuery.value,
        sort_order: currentOrder.value,
        filter: currentFilter.value,
      };
      // Reset the contest list for this tab to avoid stale data
      (props.contests as any)[currentTab.value] = [];
      currentPage.value = 1;
      hasMore.value = true;
      fetchPage(params, urlObj);
    }

    function onReset() {
      currentQuery.value = '';
      onSearchQuery();
    }

    function fetchInitialContests() {
      const urlObj = new URL(window.location.href);
      const params: UrlParams = {
        page: 1,
        tab_name: currentTab.value,
        query: currentQuery.value,
        sort_order: currentOrder.value,
        filter: currentFilter.value,
        replaceState: isFromBrowserNavigation.value || isInitialLoad.value,
      };
      // Reset the contest list for this tab to avoid stale data
      (props.contests as any)[currentTab.value] = [];
      currentPage.value = 1;
      hasMore.value = true;
      // Reset the navigation and initial load flags after using them
      isFromBrowserNavigation.value = false;
      isInitialLoad.value = false;
      fetchPage(params, urlObj);
    }

    async function loadMoreContests() {
      if (isScrollLoading.value || !hasMore.value || props.loading) return;

      isScrollLoading.value = true;
      const nextPage = currentPage.value + 1;
      const urlObj = new URL(window.location.href);
      const params: UrlParams = {
        page: nextPage,
        tab_name: currentTab.value,
        query: currentQuery.value,
        sort_order: currentOrder.value,
        filter: currentFilter.value,
      };

      try {
        await fetchPage(params, urlObj);
        currentPage.value = nextPage;

        // Check if there are more contests to load (based on pageSize)
        hasMore.value = contestList.value.length % props.pageSize === 0;
      } catch (error) {
        console.error('Error loading more contests:', error);
        // On error, re-enable the button after a delay to prevent spam
        setTimeout(() => {
          isScrollLoading.value = false;
        }, 2000);
        return;
      } finally {
        isScrollLoading.value = false;
      }
    }

    function fetchPage(params: UrlParams, urlObj: URL) {
      emit('fetch-page', { params, urlObj });
      // Turn off refreshing after a short delay to allow parent component to respond
      setTimeout(() => {
        refreshing.value = false;
      }, 1000);
    }

    function currentContestDate(contest: types.ContestListItem): string {
      return time.getDisplayForCurrentContest(contest.finish_time);
    }

    function futureContestDate(contest: types.ContestListItem): string {
      return time.getDisplayForFutureContest(contest.start_time);
    }

    function pastContestDate(contest: types.ContestListItem): string {
      return time.getDisplayForPastContest(contest.finish_time);
    }

    function getTimeLink(timeVal: Date): string {
      return `${getExternalUrl('TimeAndDateBaseURL')}?iso=${timeVal.toISOString()}`;
    }

    function orderByTitle() {
      currentOrder.value = ContestOrder.Title;
    }

    function orderByEnds() {
      currentOrder.value = ContestOrder.Ends;
    }

    function orderByDuration() {
      currentOrder.value = ContestOrder.Duration;
    }

    function orderByOrganizer() {
      currentOrder.value = ContestOrder.Organizer;
    }

    function orderByContestants() {
      currentOrder.value = ContestOrder.Contestants;
    }

    function orderBySignedUp() {
      currentOrder.value = ContestOrder.SignedUp;
    }

    function filterBySignedUp() {
      currentFilter.value = ContestFilter.SignedUp;
    }

    function filterByRecommended() {
      currentFilter.value = ContestFilter.OnlyRecommended;
    }

    function filterByAll() {
      currentFilter.value = ContestFilter.All;
    }

    const showMoreContestButtonText = computed((): string => {
      if (isScrollLoading.value) {
        return T.contestsListLoading;
      }
      return T.contestsListShowMore;
    });

    const contestList = computed((): types.ContestListItem[] => {
      switch (currentTab.value) {
        case ContestTab.Current:
          return props.contests.current;
        case ContestTab.Past:
          return props.contests.past;
        case ContestTab.Future:
          return props.contests.future;
        default:
          return props.contests.current;
      }
    });

    const contestListEmpty = computed((): boolean => {
      if (!contestList.value) return true;
      return contestList.value.length === 0;
    });

    // Watchers for props - sync internal state when parent updates props (e.g., via popstate)
    // Set isFromBrowserNavigation flag to prevent pushState from corrupting history
    watch(() => props.tab, (newValue) => {
      isFromBrowserNavigation.value = true;
      currentTab.value = newValue;
    });

    watch(() => props.sortOrder, (newValue) => {
      isFromBrowserNavigation.value = true;
      currentOrder.value = newValue;
    });

    watch(() => props.filter, (newValue) => {
      isFromBrowserNavigation.value = true;
      currentFilter.value = newValue;
    });

    watch(() => props.page, (newValue) => {
      isFromBrowserNavigation.value = true;
      currentPage.value = newValue;
    });

    // Watchers for internal state - fetch data when user interacts with UI
    watch(currentTab, (newValue, oldValue) => {
      if (typeof oldValue === 'undefined') return;
      fetchInitialContests();
    });

    watch(currentOrder, (newValue, oldValue) => {
      if (typeof oldValue === 'undefined') return;
      fetchInitialContests();
    });

    watch(currentFilter, (newValue, oldValue) => {
      if (typeof oldValue === 'undefined') return;
      fetchInitialContests();
    });

    onMounted(() => {
      fetchInitialContests();
    });

    onBeforeUnmount(() => {
      // Placeholder for cleanup when infinite scroll is re-implemented
    });

    return {
      T,
      ContestTab,
      ContestOrder,
      ContestFilter,
      currentTab,
      currentQuery,
      currentOrder,
      currentFilter,
      currentPage,
      refreshing,
      isScrollLoading,
      hasMore,
      titleLinkClass,
      onSearchQuery,
      onReset,
      loadMoreContests,
      currentContestDate,
      futureContestDate,
      pastContestDate,
      getTimeLink,
      orderByTitle,
      orderByEnds,
      orderByDuration,
      orderByOrganizer,
      orderByContestants,
      orderBySignedUp,
      filterBySignedUp,
      filterByRecommended,
      filterByAll,
      showMoreContestButtonText,
      contestList,
      contestListEmpty,
    };
  },
});

</script>

<style lang="scss" scoped>
@import '../../../../sass/main.scss';

.btn {
  padding: 0.5rem 1rem !important;
}

.card-group-menu {
  position: sticky;
  top: 62px;
  z-index: 10;
  border: none;
  border-bottom: 1px solid var(--arena-scoreboard-hover-color);
  border-radius: 0.25rem 0.25rem 0 0;
}

.title {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 1.8rem;
}

.btn-style {
  border-color: var(--arena-button-border-color);
}

.form-control {
  height: auto;
}

.reset-btn {
  line-height: 1.5;
  color: var(--arena-reset-text-color);
  background-color: var(--arena-runs-table-status-je-ve-font-color);
  background-clip: padding-box;
  border: none;
  border-top: 1px solid var(--arena-reset-border-color);
  border-bottom: 1px solid var(--arena-reset-border-color);
  border-radius: unset;
}

.btn-primary {
  background-color: var(--arena-button-border-color) !important;
  height: 2.5rem;
  width: 7.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.contest-card {
  height: 150px;
  padding: 1rem;
}

.line {
  height: 100%;
  background: var(
    --arena-submissions-list-skeletonloader-final-background-color
  );
  border-radius: 8px;
  animation: loading 1.5s infinite;
}

.horizontal-scroll-container {
  overflow-x: auto;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 1rem;
}

.section-separator {
  border-bottom: 1px solid var(--arena-contest-list-separator-color, #e0e0e0);
  padding-bottom: 2rem;
  margin-bottom: 2rem !important;
}

.empty-category {
  text-align: center;
  font-size: 200%;
  margin: 1em;
  color: var(--arena-contest-list-empty-category-font-color);
}

.btns-group {
  justify-content: flex-end;

  .dropdown {
    margin-right: 1rem;
  }
}

@media screen and (max-width: 768px) {
  .title {
    font-size: 1.5rem;
    text-align: center;
  }

  .btns-group {
    justify-content: flex-start;

    .dropdown {
      flex: 1;
      gap: 1rem;
      margin-right: 0.8rem;
    }
  }
}

.scroll-wrapper {
  &:hover .scroll-btn {
    opacity: 0.8;
    visibility: visible;
  }
}

.scroll-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;

  &:hover {
    opacity: 1 !important;
  }
}

.scroll-left {
  left: 10px;
}

.scroll-right {
  right: 10px;
}
</style>
