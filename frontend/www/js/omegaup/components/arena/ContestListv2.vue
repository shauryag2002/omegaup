<template>
  <div>
    <div class="col-sm-12">
      <h1 class="title">{{ T.wordsContests }}</h1>
    </div>
    <b-card no-body>
      <b-tabs
        class="sidebar"
        pills
        card
        vertical
        nav-wrapper-class="contest-list-nav col-md-2 col-sm-12 test-class"
      >
        <b-card class="card-group-menu">
          <b-container>
            <b-row class="justify-content-between" align-v="center">
              <b-col class="col-12 col-md-5 mb-2 mb-md-0 p-0">
                <form @submit.prevent="onSearchQuery">
                  <div class="input-group">
                    <input
                      v-model.lazy="currentQuery"
                      class="form-control nav-link"
                      type="text"
                      name="query"
                      autocomplete="off"
                      autocorrect="off"
                      autocapitalize="off"
                      spellcheck="false"
                      :placeholder="T.wordsKeyword"
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
                  <b-dropdown-item
                    href="#"
                    data-order-by-ends
                    @click="orderByEnds"
                  >
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
                  <b-dropdown-item
                    href="#"
                    data-filter-by-all
                    @click="filterByAll"
                  >
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
        <b-tab
          ref="currentContestTab"
          class="scroll-content"
          :title="T.contestListCurrent"
          :title-link-class="titleLinkClass(ContestTab.Current)"
          :active="currentTab === ContestTab.Current"
          @click="currentTab = ContestTab.Current"
        >
          <template v-if="loading || refreshing">
            <div
              v-for="index in 3"
              :key="`current-${index}`"
              class="card contest-card mb-2"
            >
              <omegaup-contest-skeleton></omegaup-contest-skeleton>
            </div>
          </template>
          <div v-else-if="contestListEmpty" class="empty-category">
            {{ T.contestListEmpty }}
          </div>
          <template v-else>
            <omegaup-contest-card
              v-for="contestItem in contestList"
              :key="contestItem.contest_id"
              :contest="contestItem"
            >
              <template #contest-button-scoreboard>
                <div></div>
              </template>
              <template #text-contest-date>
                <b-card-text>
                  <font-awesome-icon icon="calendar-alt" />
                  <a
                    :href="getTimeLink(contestItem.finish_time)"
                    :title="contestItem.finish_time.toLocaleString()"
                  >
                    {{ currentContestDate(contestItem) }}
                  </a>
                </b-card-text>
              </template>
              <template #contest-dropdown>
                <div></div>
              </template>
            </omegaup-contest-card>
          </template>
          <template v-if="isScrollLoading && currentTab === ContestTab.Current">
            <div
              v-for="index in 3"
              :key="`loading-more-current-${index}`"
              class="card mb-2"
            >
              <omegaup-contest-skeleton></omegaup-contest-skeleton>
            </div>
          </template>

          <div
            v-if="
              !loading &&
              !contestListEmpty &&
              hasMore &&
              currentTab === ContestTab.Current
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
        </b-tab>
        <b-tab
          ref="futureContestTab"
          class="scroll-content"
          :title="T.contestListFuture"
          :title-link-class="titleLinkClass(ContestTab.Future)"
          :active="currentTab === ContestTab.Future"
          @click="currentTab = ContestTab.Future"
        >
          <template v-if="loading || refreshing">
            <div
              v-for="index in 3"
              :key="`future-${index}`"
              class="card contest-card mb-2"
            >
              <omegaup-contest-skeleton></omegaup-contest-skeleton>
            </div>
          </template>
          <div v-else-if="contestListEmpty" class="empty-category">
            {{ T.contestListEmpty }}
          </div>
          <template v-else>
            <omegaup-contest-card
              v-for="contestItem in contestList"
              :key="contestItem.contest_id"
              :contest="contestItem"
            >
              <template #contest-button-scoreboard>
                <div></div>
              </template>
              <template #text-contest-date>
                <b-card-text>
                  <font-awesome-icon icon="calendar-alt" />
                  <a
                    :href="getTimeLink(contestItem.start_time)"
                    :title="contestItem.start_time.toLocaleString()"
                  >
                    {{ futureContestDate(contestItem) }}
                  </a>
                </b-card-text>
              </template>
              <template #contest-button-enter>
                <div></div>
              </template>
              <template #contest-dropdown>
                <div></div>
              </template>
            </omegaup-contest-card>
          </template>
          <template v-if="isScrollLoading && currentTab === ContestTab.Future">
            <div
              v-for="index in 3"
              :key="`loading-more-future-${index}`"
              class="card mb-2"
            >
              <omegaup-contest-skeleton></omegaup-contest-skeleton>
            </div>
          </template>

          <div
            v-if="
              !loading &&
              !contestListEmpty &&
              hasMore &&
              currentTab === ContestTab.Future
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
        </b-tab>
        <b-tab
          ref="pastContestTab"
          class="scroll-content"
          :title="T.contestListPast"
          :title-link-class="titleLinkClass(ContestTab.Past)"
          :active="currentTab === ContestTab.Past"
          @click="currentTab = ContestTab.Past"
        >
          <template v-if="loading || refreshing">
            <div
              v-for="index in 3"
              :key="`past-${index}`"
              class="card contest-card mb-2"
            >
              <omegaup-contest-skeleton></omegaup-contest-skeleton>
            </div>
          </template>
          <div v-else-if="contestListEmpty" class="empty-category">
            {{ T.contestListEmpty }}
          </div>
          <template v-else>
            <omegaup-contest-card
              v-for="contestItem in contestList"
              :key="contestItem.contest_id"
              :contest="contestItem"
            >
              <template #contest-enroll-status>
                <div></div>
              </template>
              <template #text-contest-date>
                <b-card-text>
                  <font-awesome-icon icon="calendar-alt" />
                  <a
                    :href="getTimeLink(contestItem.finish_time)"
                    :title="contestItem.finish_time.toLocaleString()"
                  >
                    {{ pastContestDate(contestItem) }}
                  </a>
                </b-card-text>
              </template>
              <template #contest-button-enter>
                <div></div>
              </template>
              <template #contest-button-see-details>
                <div></div>
              </template>
            </omegaup-contest-card>
          </template>
          <template v-if="isScrollLoading && currentTab === ContestTab.Past">
            <div
              v-for="index in 3"
              :key="`loading-more-past-${index}`"
              class="card mb-2"
            >
              <omegaup-contest-skeleton></omegaup-contest-skeleton>
            </div>
          </template>

          <div
            v-if="
              !loading &&
              !contestListEmpty &&
              hasMore &&
              currentTab === ContestTab.Past
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
        </b-tab>
      </b-tabs>
    </b-card>
  </div>
</template>

<script lang="ts">
const debounce = (fn: (...args: any[]) => void, waitTime: number) => {
  let timer: number | null = null;
  return (...args: any[]) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn(...args);
    }, waitTime) as any;
  };
};

import { defineComponent, ref, computed, watch, onMounted, onBeforeUnmount, onUpdated, getCurrentInstance, PropType } from 'vue';
import { types } from '../../api_types';
import * as ui from '../../ui';
import T from '../../lang';
import { getExternalUrl } from '../../urlHelper';

// Import Bootstrap an BootstrapVue CSS files (order is important)
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css';
import { BCard, BCol, BContainer, BDropdown, BRow } from 'bootstrap-vue-next';

// Import Only Required Plugins
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
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
  replaceState?: boolean;
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
    const instance = getCurrentInstance();

    const currentTab = ref<ContestTab>(props.tab);
    const currentQuery = ref(props.query);
    const currentOrder = ref<ContestOrder>(props.sortOrder);
    const currentFilter = ref<ContestFilter>(props.filter);
    const currentPage = ref(props.page);
    const refreshing = ref(false);
    const isScrollLoading = ref(false);
    const hasMore = ref(true);
    const columnsPerRow = ref(3);
    const viewAllCategory = ref<ContestTab | null>(null);
    const scrollPositions = ref<{ [key: string]: number }>({});
    const maxScrollPositions = ref<{ [key: string]: number }>({});

    function titleLinkClass(tab: ContestTab) {
      if (currentTab.value === tab) {
        return ['text-center', 'active-title-link'];
      } else {
        return ['text-center', 'title-link'];
      }
    }

    function setViewAll(category: ContestTab | null) {
      viewAllCategory.value = category;
      if (category) {
        currentTab.value = category;
        fetchInitialContests();
      } else {
        // Returning to summary, ensure we have data for all
        fetchInitialContests();
      }
    }

    function getTabTitle(tab: ContestTab | null): string {
      if (!tab) return '';
      switch (tab) {
        case ContestTab.Current:
          return T.contestListCurrent;
        case ContestTab.Future:
          return T.contestListFuture;
        case ContestTab.Past:
          return T.contestListPast;
        default:
          return '';
      }
    }

    function getContestsForTab(tab: ContestTab): types.ContestListItem[] {
      switch (tab) {
        case ContestTab.Current:
          return props.contests.current || [];
        case ContestTab.Future:
          return props.contests.future || [];
        case ContestTab.Past:
          return props.contests.past || [];
        default:
          return [];
      }
    }

    function onSearchQuery() {
      fetchInitialContests();
    }

    const onSearchQueryDebounced = debounce(onSearchQuery, 300);

    function onReset() {
      currentQuery.value = '';
    }

    function fetchInitialContests() {
      if (viewAllCategory.value) {
        const urlObj = new URL(window.location.href);
        const params: UrlParams = {
          page: 1,
          tab_name: viewAllCategory.value,
          query: currentQuery.value,
          sort_order: currentOrder.value,
          filter: currentFilter.value,
        };
        (props.contests as any)[viewAllCategory.value] = [];
        currentPage.value = 1;
        hasMore.value = true;
        fetchPage(params, urlObj);
      } else {
        // Fetch all for summary view
        [ContestTab.Current, ContestTab.Future, ContestTab.Past].forEach(
          (tab) => {
            const urlObj = new URL(window.location.href);
            const params: UrlParams = {
              page: 1,
              tab_name: tab,
              query: currentQuery.value,
              sort_order: currentOrder.value,
              filter: currentFilter.value,
            };
            fetchPage(params, urlObj, tab === ContestTab.Current);
          },
        );
      }
    }

    function updateColumnsPerRow() {
      if (window.innerWidth >= 992) {
        columnsPerRow.value = 3;
      } else if (window.innerWidth >= 768) {
        columnsPerRow.value = 2;
      } else {
        columnsPerRow.value = 1;
      }
    }

    function getScrollContainer(tab: ContestTab): HTMLElement | null {
      const refs = instance?.proxy?.$refs;
      if (!refs) return null;
      const el = refs[`scrollContainer_${tab}`];
      if (Array.isArray(el)) return el[0] as HTMLElement;
      return (el as HTMLElement) || null;
    }

    function scrollLeft(tab: ContestTab) {
      const container = getScrollContainer(tab);
      if (container) {
        container.scrollBy({ left: -600, behavior: 'smooth' });
      }
    }

    function scrollRight(tab: ContestTab) {
      const container = getScrollContainer(tab);
      if (container) {
        container.scrollBy({ left: 600, behavior: 'smooth' });
      }
    }

    function onScroll(tab: ContestTab) {
      const container = getScrollContainer(tab);
      if (container) {
        scrollPositions.value[tab] = container.scrollLeft;
        maxScrollPositions.value[tab] =
          container.scrollWidth - container.clientWidth;
      }
    }

    function canScrollLeft(tab: ContestTab): boolean {
      return (scrollPositions.value[tab] || 0) > 0;
    }

    function canScrollRight(tab: ContestTab): boolean {
      const contests = getContestsForTab(tab);
      if (contests.length <= 3) return false;

      const currentScroll = scrollPositions.value[tab] || 0;
      const maxScroll = maxScrollPositions.value[tab] || 0;
      // If maxScroll is 0, we might not have calculated it yet, so check if we have enough items
      if (maxScroll === 0) {
        return true;
      }
      return currentScroll < maxScroll - 10; // -10 for tolerance
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

    function fetchPage(params: UrlParams, urlObj: URL, shouldUpdateUrl: boolean = true) {
      emit('fetch-page', { params, urlObj, shouldUpdateUrl });
      // Turn off refreshing after a short delay to allow parent component to respond
      setTimeout(() => {
        refreshing.value = false;
      }, 1000);
    }

    function finishContestDate(contest: types.ContestListItem): string {
      return contest.finish_time.toLocaleDateString();
    }

    function startContestDate(contest: types.ContestListItem): string {
      return contest.start_time.toLocaleDateString();
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

    const showMoreThreshold = computed((): number => {
      return columnsPerRow.value * 2;
    });

    const contestList = computed((): types.ContestListItem[] => {
      const tab = viewAllCategory.value || currentTab.value;
      switch (tab) {
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
      updateColumnsPerRow();
      window.addEventListener('resize', updateColumnsPerRow);
    });

    onBeforeUnmount(() => {
      window.removeEventListener('resize', updateColumnsPerRow);
    });

    onUpdated(() => {
      // Recalculate scroll limits when DOM updates
      [ContestTab.Current, ContestTab.Future, ContestTab.Past].forEach((tab) => {
        onScroll(tab);
      });
    });

    return {
      T,
      ui,
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
      viewAllCategory,
      scrollPositions,
      maxScrollPositions,
      titleLinkClass,
      setViewAll,
      getTabTitle,
      getContestsForTab,
      onSearchQuery,
      onSearchQueryDebounced,
      onReset,
      scrollLeft,
      scrollRight,
      onScroll,
      canScrollLeft,
      canScrollRight,
      loadMoreContests,
      finishContestDate,
      startContestDate,
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
      showMoreThreshold,
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
  color: #6c757d;
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

.sidebar {
  :deep(.contest-list-nav) {
    background-color: var(
      --arena-contest-list-sidebar-tab-list-background-color
    );

    .active-title-link {
      background-color: var(
        --arena-contest-list-sidebar-tab-list-link-background-color--active
      ) !important;
    }

    .title-link {
      color: var(
        --arena-contest-list-sidebar-tab-list-link-font-color
      ) !important;
    }
  }
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

  .tabs {
    flex-direction: column;
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
</style>
