<template>
  <div class="container-fluid max-width card pr-0 pl-0 custom-card">
    <ul class="nav nav-tabs introjs-tabs" role="tablist">
      <li
        v-for="(tabName, tabKey) in tabNames"
        :key="tabKey"
        class="nav-item"
        role="presentation"
      >
        <a
          class="nav-link"
          :href="`#${tabKey}`"
          :class="{ active: currentSelectedTab === tabKey }"
          data-toggle="tab"
          role="tab"
          @click="currentSelectedTab = tabKey"
          >{{ tabName }}</a
        >
      </li>
      <li class="ml-auto">
        <a class="nav-link border-0" href="/course/home/">{{
          T.wordsReadMore
        }}</a>
      </li>
    </ul>
    <div class="tab-content">
      <div class="row m-0 mt-4">
        <div class="col-md-4 col-lg-3 p-0 ml-4">
          <input
            v-model="searchText"
            class="form-control introjs-search"
            type="text"
            :placeholder="T.courseCardsListSearch"
          />
        </div>
        <div
          v-if="currentSelectedTab === Tab.Public"
          class="col-md-4 col-lg-3 p-0 ml-3"
        >
          <select v-model="levelFilter" class="form-control">
            <option :value="Level.All">{{ T.courseLevelAllLevels }}</option>
            <option :value="Level.Introductory">
              {{ T.courseLevelIntroductoryLevel }}
            </option>
            <option :value="Level.Intermediate">
              {{ T.courseLevelIntermediateLevel }}
            </option>
            <option :value="Level.Advanced">
              {{ T.courseLevelAdvancedLevel }}
            </option>
          </select>
        </div>
      </div>
      <div
        v-for="(tabName, tabKey) in tabNames"
        :key="tabKey"
        class="tab-pane fade"
        :class="{
          show: currentSelectedTab === tabKey,
          active: currentSelectedTab === tabKey,
        }"
        role="tabpanel"
      >
        <div
          v-if="tabKey === Tab.Public"
          class="row row-cols-1 row-cols-md-2 row-cols-xl-3 p-4 introjs-join"
        >
          <omegaup-course-card-public
            v-for="course in filteredCards"
            :key="course.alias"
            :course="course"
            :logged-in="loggedIn"
            :has-visited-section="hasVisitedSection"
          ></omegaup-course-card-public>
        </div>
        <div
          v-if="tabKey === Tab.Enrolled"
          class="row"
          :class="{
            'row-cols-1 row-cols-md-2 row-cols-xl-3 p-4':
              loggedIn && filteredCards.length,
            'justify-content-center': !loggedIn || !filteredCards.length,
          }"
        >
          <template v-if="loggedIn">
            <template v-if="filteredCards.length">
              <omegaup-course-card-enrolled
                v-for="course in filteredCards"
                :key="course.alias"
                :course="course"
              ></omegaup-course-card-enrolled>
            </template>
            <div v-else class="empty-content my-2">
              {{ T.courseTabsEmptyEnrolledCourses }}
            </div>
          </template>
          <div v-else class="empty-content my-2">
            {{ T.courseCardMustLogIn }}
          </div>
        </div>
        <div
          v-if="tabKey === Tab.Finished"
          class="row"
          :class="{
            'row-cols-1 row-cols-md-2 row-cols-xl-3 p-4':
              loggedIn && filteredCards.length,
            'justify-content-center': !loggedIn || !filteredCards.length,
          }"
        >
          <template v-if="loggedIn">
            <template v-if="filteredCards.length">
              <omegaup-course-card-finished
                v-for="course in filteredCards"
                :key="course.alias"
                :course="course"
              ></omegaup-course-card-finished>
            </template>
            <div v-else class="empty-content my-2">
              {{ T.courseTabsEmptyFinishedCourses }}
            </div>
          </template>
          <div v-else class="empty-content my-2">
            {{ T.courseCardMustLogIn }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, PropType } from 'vue';
import { types } from '../../api_types';
import T from '../../lang';
import * as ui from '../../ui';
import latinize from 'latinize';
import 'intro.js/introjs.css';
import introJs from 'intro.js';
import { getCookie, setCookie } from '../../cookies';

import omegaup_Markdown from '../Markdown.vue';
import course_CardPublic from './CardPublic.vue';
import course_CardEnrolled from './CardEnrolled.vue';
import course_CardFinished from './CardFinished.vue';

export enum Tab {
  Enrolled = 'enrolled',
  Public = 'public',
  Finished = 'finished',
}

export enum Level {
  All = 'all',
  Introductory = 'introductory',
  Intermediate = 'intermediate',
  Advanced = 'advanced',
}

export default defineComponent({
  name: 'CourseTabs',
  components: {
    'omegaup-course-card-public': course_CardPublic,
    'omegaup-course-card-enrolled': course_CardEnrolled,
    'omegaup-course-card-finished': course_CardFinished,
    'omegaup-markdown': omegaup_Markdown,
  },
  props: {
    courses: {
      type: Object as PropType<{
        enrolled: types.CourseCardEnrolled[];
        public: types.CourseCardPublic[];
        finished: types.CourseCardFinished[];
      }>,
      required: true,
    },
    loggedIn: { type: Boolean, default: false },
    selectedTab: { type: String as PropType<Tab>, default: Tab.Public },
    hasVisitedSection: { type: Boolean, required: true },
  },
  setup(props) {
    const currentSelectedTab = ref(props.selectedTab);
    const searchText = ref('');
    const levelFilter = ref(Level.All);

    const tabNames = computed((): Record<Tab, string> => {
      return {
        [Tab.Public]: T.courseTabPublic,
        [Tab.Enrolled]: props.loggedIn
          ? ui.formatString(T.courseTabEnrolled, {
              course_count: props.courses.enrolled.length,
            })
          : T.courseTabEnrolledUnlogged,
        [Tab.Finished]: props.loggedIn
          ? ui.formatString(T.courseTabFinished, {
              course_count: props.courses.finished.length,
            })
          : T.courseTabFinishedUnlogged,
      };
    });

    const filteredCards = computed(
      ():
        | types.CourseCardEnrolled[]
        | types.CourseCardPublic[]
        | types.CourseCardFinished[] => {
        switch (currentSelectedTab.value) {
          case Tab.Enrolled:
            return props.courses.enrolled.filter(
              (course) =>
                searchText.value === '' ||
                latinize(course.name.toLowerCase()).includes(
                  latinize(searchText.value.toLowerCase()),
                ),
            );
          case Tab.Finished:
            return props.courses.finished.filter(
              (course) =>
                searchText.value === '' ||
                latinize(course.name.toLowerCase()).includes(
                  latinize(searchText.value.toLowerCase()),
                ),
            );
          default:
            return props.courses.public.filter((course) => {
              const matchesText =
                searchText.value === '' ||
                latinize(course.name.toLowerCase()).includes(
                  latinize(searchText.value.toLowerCase()),
                );

              const matchesLevel =
                levelFilter.value === Level.All ||
                course.level === levelFilter.value;

              return matchesText && matchesLevel;
            });
        }
      },
    );

    onMounted(() => {
      const title = T.joinCourseInteractiveGuideTitle;
      if (!props.hasVisitedSection) {
        introJs()
          .setOptions({
            nextLabel: T.interactiveGuideNextButton,
            prevLabel: T.interactiveGuidePreviousButton,
            doneLabel: T.interactiveGuideDoneButton,
            steps: [
              {
                title,
                intro: T.joinCourseInteractiveGuideWelcome,
              },
              {
                element: document.querySelector<HTMLElement>('.introjs-tabs'),
                title,
                intro: T.joinCourseInteractiveGuideTabs,
              },
              {
                element: document.querySelector<HTMLElement>('.introjs-search'),
                title,
                intro: T.joinCourseInteractiveGuideSearch,
              },
              {
                element: document.querySelector<HTMLElement>('.introjs-join'),
                title,
                intro: T.joinCourseInteractiveGuideJoin,
              },
            ],
          })
          .start();
        setCookie('has-visited-join-course', true);
      }
    });

    return {
      T,
      ui,
      Tab,
      Level,
      currentSelectedTab,
      searchText,
      levelFilter,
      tabNames,
      filteredCards,
    };
  },
});
</script>

<style lang="scss">
@import '../../../../sass/main.scss';

.card > .row.no-gutters {
  background-color: $omegaup-white;
  min-height: 13.5rem;
  overflow-y: visible;

  .course-data p {
    font-size: 0.9rem;
  }

  .public-course-card {
    background-color: $omegaup-blue;
    height: 1em;
  }

  .enrolled-course-card {
    background-color: $omegaup-pink--lighter;
    height: 1em;
  }

  @media only screen and (min-width: 576px) {
    .public-course-card,
    .enrolled-course-card {
      height: auto;
    }
  }

  .finished-course-card {
    background-color: $omegaup-grey--lighter;
  }

  .progress-bar {
    background-color: $omegaup-yellow;
  }

  .course-star {
    font-size: 3.2rem;
    line-height: normal;
  }
}

.empty-content {
  text-align: center;
  font-size: 2.25rem;
  color: var(--arena-contest-list-empty-category-font-color);
}

.max-width {
  max-width: 68.8rem;
  margin: 4rem auto;
}

.nav-link {
  padding: 0.6rem 1.2rem;
}

.nav-tabs,
.nav-link,
.nav-link-active,
.nav-link-hover {
  border-top: none !important;
  border-top-left-radius: 0 !important;
  border-top-right-radius: 0 !important;
}

@media (max-width: 576px) {
  .custom-card {
    padding: 1.25rem 2rem !important;
  }

  .row.m-0.mt-4 {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
  }

  .row.m-0.mt-4 > div {
    width: calc(50% - 25px);
    flex: 0 0 calc(50% - 25px);
    max-width: calc(50% - 25px);
  }
}

@media (min-width: 577px) and (max-width: 767px) {
  .row.m-0.mt-4 {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
  }

  .row.m-0.mt-4 > div {
    width: calc(50% - 25px);
    flex: 0 0 calc(50% - 25px);
    max-width: calc(50% - 25px);
  }
}
</style>
