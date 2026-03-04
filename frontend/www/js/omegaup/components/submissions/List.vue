<template>
  <div ref="scrollContainer" submissions-problem @scroll="onScroll">
    <div class="text-center mb-5 submissions-title">
      <h2>
        {{ T.submissionsListTitle }}
      </h2>
      <h4 v-if="!includeUser && submissions.length > 0">
        {{ T.wordsBy }}
        <omegaup-username
          :username="submissions[0].username"
          :classname="submissions[0].classname"
          :linkify="true"
        ></omegaup-username>
      </h4>
    </div>
    <div class="card">
      <div v-if="includeUser" class="card-body d-flex align-items-center">
        <omegaup-common-typeahead
          :existing-options="searchResultUsers"
          v-model:value="searchedUsername"
          :max-results="10"
          class="mr-2"
          @update-existing-options="
            (query) => $emit('update-search-result-users', query)
          "
        />

        <a :href="hrefSearchUser">
          <button class="btn btn-primary" type="button">
            {{ T.searchUser }}
          </button>
        </a>
      </div>
      <div class="table-responsive">
        <table class="table mb-0 submissions-table">
          <thead>
            <tr>
              <th scope="col" class="text-center">{{ T.wordsTime }}</th>
              <th v-if="includeUser" scope="col" class="text-center">
                {{ T.submissionsListCoder }}
              </th>
              <th scope="col" class="text-center">{{ T.wordsProblem }}</th>
              <th
                :class="{ 'fixed-width-column': includeUser }"
                class="text-center"
                scope="col"
              >
                {{ T.wordsLanguage }}
              </th>
              <th scope="col" class="text-center fixed-with-column">
                {{ T.wordsVerdict }}
              </th>
              <th scope="col" class="text-right">{{ T.wordsRuntime }}</th>
              <th scope="col" class="text-right">{{ T.wordsMemory }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="submission in submissions" :key="submission.guid">
              <td class="text-center">
                {{ time.formatDateTime(submission.time) }}
              </td>
              <td v-if="includeUser" class="text-center">
                <omegaup-username
                  :username="submission.username"
                  :classname="submission.classname"
                  :linkify="true"
                >
                </omegaup-username>
                <br />
                <a
                  class="school-text"
                  :href="`/schools/profile/${submission.school_id}/`"
                  >{{ submission.school_name }}</a
                >
              </td>
              <td class="text-center">
                <a :href="`/arena/problem/${submission.alias}/`">{{
                  submission.title
                }}</a>
              </td>
              <td class="text-center">{{ submission.language }}</td>
              <td
                class="text-center verdict"
                :class="`verdict-${submission.verdict}`"
              >
                {{ T[`verdict${submission.verdict}`] }}
              </td>
              <td class="text-center">
                {{
                  submission.runtime === 0
                    ? '—'
                    : ui.formatString(T.submissionRunTimeInSeconds, {
                        value: (
                          parseFloat(submission.runtime || '0') / 1000
                        ).toFixed(2),
                      })
                }}
              </td>
              <td class="text-center">
                {{
                  submission.memory === 0
                    ? '—'
                    : ui.formatString(T.submissionMemoryInMegabytes, {
                        value: (
                          parseFloat(submission.memory) /
                          (1024 * 1024)
                        ).toFixed(2),
                      })
                }}
              </td>
            </tr>
            <template v-if="loading">
              <tr v-for="index in 3" :key="index">
                <td colspan="16">
                  <div class="line"></div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  PropType,
} from 'vue';
import { types } from '../../api_types';
import T from '../../lang';
import * as ui from '../../ui';
import * as time from '../../time';
import UserName from '../user/Username.vue';
import common_Typeahead from '../common/Typeahead.vue';
import common_Paginator from '../common/Paginator.vue';

export default defineComponent({
  name: 'SubmissionsList',
  components: {
    'omegaup-username': UserName,
    'omegaup-common-typeahead': common_Typeahead,
    'omegaup-common-paginator': common_Paginator,
  },
  props: {
    page: { type: Number, required: true },
    includeUser: { type: Boolean, required: true },
    submissions: {
      type: Array as PropType<types.Submission[]>,
      required: true,
    },
    searchResultUsers: {
      type: Array as PropType<types.ListItem[]>,
      required: true,
    },
    loading: { type: Boolean, required: true },
    endOfResults: { type: Boolean, required: true },
  },
  emits: ['fetch-more-data', 'update-search-result-users'],
  setup(props, { emit }) {
    const searchedUsername = ref<types.ListItem | null>(null);
    let _scrollHandler: (() => void) | null = null;

    const isScrollDisabled = computed(
      () => props.loading || props.endOfResults,
    );

    const hrefSearchUser = computed(() => {
      if (!searchedUsername.value?.key) {
        return '/submissions/';
      }
      return `/submissions/${encodeURIComponent(searchedUsername.value?.key)}/`;
    });

    function onScroll(): void {
      if (isScrollDisabled.value) return;
      const scrollBottom =
        document.documentElement.scrollHeight -
        window.innerHeight -
        window.scrollY;
      if (scrollBottom < 10) {
        emit('fetch-more-data');
      }
    }

    onMounted(() => {
      _scrollHandler = () => onScroll();
      window.addEventListener('scroll', _scrollHandler);
    });

    onBeforeUnmount(() => {
      if (_scrollHandler) {
        window.removeEventListener('scroll', _scrollHandler);
      }
    });

    return {
      T,
      ui,
      time,
      searchedUsername,
      hrefSearchUser,
      isScrollDisabled,
      onScroll,
    };
  },
});
</script>

<style lang="scss">
@import '../../../../sass/main.scss';

table.submissions-table > tbody > tr > td {
  vertical-align: middle;
}

.verdict-AC {
  background: var(--arena-submissions-list-verdict-ac-background-color);
}

.verdict-WA {
  background: var(--arena-runs-table-status-wa-background-color);
}

.verdict-MLE {
  background: var(--arena-runs-table-status-mle-background-color);
}

.verdict-TLE {
  background: var(--arena-runs-table-status-tle-background-color);
}

.verdict-CE {
  background: var(--arena-submissions-list-verdict-ce-background-color);
}

.verdict-JE,
.verdict-VE {
  background: var(--arena-submissions-list-verdict-je-ve-background-color);
}

.verdict-PA {
  background: var(--arena-runs-table-status-pa-background-color);
}

.verdict-OLE {
  background: var(--arena-runs-table-status-ole-background-color);
}

.verdict-RTE {
  background: var(--arena-runs-table-status-rte-background-color);
}

.verdict-RFE {
  background: var(--arena-runs-table-status-rfe-background-color);
}

.school-text {
  font-size: 0.9em;
}

.fixed-width-column {
  width: 180px;
}

.submissions-title h2 {
  font-size: 1.8rem;
}

[submissions-problem] .tags-input-wrapper-default {
  padding: 0.35rem 0.25rem 0.7rem 0.25rem;
}
.line {
  height: 49px;
  background: var(
    --arena-submissions-list-skeletonloader-final-background-color
  );
  border-radius: 8px;
  animation: loading 1.5s infinite;
}
@keyframes loading {
  0% {
    background: var(
      --arena-submissions-list-skeletonloader-initial-background-color
    );
  }
  50% {
    background: var(
      --arena-submissions-list-skeletonloader-final-background-color
    );
  }
  100% {
    background: var(
      --arena-submissions-list-skeletonloader-initial-background-color
    );
  }
}
</style>
