<template>
  <header>
    <nav
      class="navbar navbar-expand-lg navbar-color fixed-top p-0 text-right"
      data-enable-hover-dropdown
    >
      <div class="container-xl pl-0 pl-xl-3">
        <a class="navbar-brand p-3 mr-0 mr-sm-3" href="/">
          <img
            alt="omegaUp"
            src="/media/omegaup_curves.png"
            height="20"
            class="d-inline-block"
          />
          <img
            v-show="omegaUpLockDown"
            alt="lockdown"
            title="lockdown"
            :src="lockDownImage"
            :class="{ 'd-inline-block': omegaUpLockDown }"
            height="20"
          />
        </a>

        <div class="d-inline-flex d-flex-row order-lg-1">
          <div
            v-if="isLoggedIn"
            class="navbar-nav navbar-right align-items-end d-lg-none"
          >
            <OmegaupNotificationsClarifications
              v-if="inContest"
              :clarifications="clarifications"
            ></OmegaupNotificationsClarifications>
            <OmegaupNotificationList
              v-else
              :notifications="notifications"
              @read="readNotifications"
            ></OmegaupNotificationList>
          </div>
          <ul v-if="!isLoggedIn" class="navbar-nav navbar-right d-lg-flex mr-2">
            <li class="nav-item d-flex align-items-center">
              <a
                class="nav-link nav-login-text pr-0"
                :href="formattedLoginURL"
                data-login-button
                @click.prevent="emitActiveTab(AvailableTabs.Login)"
              >
                {{ T.navbarLogin }}
              </a>
              <span class="nav-link nav-login-text px-1">/</span>
              <a
                class="nav-link nav-login-text pl-0"
                :href="formattedSignupURL"
                data-signup-button
                @click.prevent="emitActiveTab(AvailableTabs.Signup)"
              >
                {{ T.navbarRegister }}
              </a>
            </li>
          </ul>
          <button
            class="navbar-toggler mr-2"
            type="button"
            data-toggle="collapse"
            data-target=".omegaup-navbar"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span class="navbar-toggler-icon"></span>
          </button>
        </div>

        <div class="collapse navbar-collapse omegaup-navbar">
          <OmegaupNavbarItems
            :omega-up-lock-down="omegaUpLockDown"
            :in-contest="inContest"
            :is-logged-in="isLoggedIn"
            :is-reviewer="isReviewer"
            :is-admin="isAdmin"
            :is-main-user-identity="isMainUserIdentity"
            :is-under13-user="isUnder13User"
            :navbar-section="navbarSection"
          >
          </OmegaupNavbarItems>
          <!-- in lockdown or contest mode there is no left navbar -->

          <div class="d-flex px-3 justify-content-between">
            <ul
              v-if="isLoggedIn"
              class="navbar-nav navbar-right align-items-right"
            >
              <li class="d-none d-lg-flex">
                <OmegaupNotificationsClarifications
                  v-if="inContest"
                  :clarifications="clarifications"
                ></OmegaupNotificationsClarifications>
                <OmegaupNotificationList
                  v-else
                  :notifications="notifications"
                  @read="readNotifications"
                ></OmegaupNotificationList>
              </li>
              <li
                class="nav-item dropdown nav-user nav-item-align"
                data-nav-right
              >
                <a
                  class="nav-link px-2 dropdown-toggle nav-user-link"
                  href="#"
                  role="button"
                  data-nav-user
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <img
                    :src="gravatarURL51"
                    height="45"
                    class="pr-1 pt-1"
                    :alt="T.navUserAvatarAlt"
                  /><span class="username mr-2" :title="currentUsername">{{
                    currentUsername
                  }}</span>
                  <OmegaupCommonGraderBadge
                    v-show="isAdmin"
                    :queue-length="graderQueueLength"
                    :error="errorMessage !== null"
                    class="mr-1"
                  ></OmegaupCommonGraderBadge>
                </a>
                <div
                  class="dropdown-menu dropdown-menu-right allow-overflow h-auto overflow-auto"
                  data-dropdown-menu
                >
                  <template v-if="!omegaUpLockDown && (!inContest || isAdmin)">
                    <div class="text-center mb-1">
                      <img
                        :src="gravatarURL128"
                        height="70"
                        class="rounded-circle mb-1"
                        :title="currentUsername"
                        :alt="T.navUserAvatarAlt"
                      />
                      <h5 v-if="currentName !== ''" class="mx-2">
                        {{ currentName }}
                      </h5>
                      <h5 v-else class="mx-2">{{ currentUsername }}</h5>
                      <h6 class="mx-2">{{ currentEmail }}</h6>
                    </div>
                    <a
                      v-show="!omegaUpLockDown && (!inContest || isAdmin)"
                      class="dropdown-item text-center"
                      data-nav-profile
                      href="/profile/"
                    >
                      <FontAwesomeIcon :icon="['fas', 'user']" />
                      {{ T.navViewProfile }}
                      <div
                        v-if="profileProgress !== 0"
                        class="progress mt-2 position-relative"
                      >
                        <div
                          class="progress-bar progress-bar-striped bg-info"
                          role="progressbar"
                          :style="{ width: `${profileProgress}%` }"
                          :aria-valuenow="profileProgress"
                          aria-valuemin="0"
                          aria-valuemax="100"
                        ></div>
                        <small class="progress-text">
                          {{ profileProgress.toFixed(1) }}%
                        </small>
                      </div>
                    </a>
                    <div class="dropdown-divider"></div>
                    <div v-if="identitiesNotLoggedIn.length > 0" class="mb-1">
                      <div
                        v-for="identity in identitiesNotLoggedIn"
                        :key="identity.username"
                      >
                        <button
                          class="btn btn-link dropdown-item"
                          @click="emit('change-account', identity.username)"
                        >
                          <img
                            :src="gravatarURL51"
                            height="45"
                            class="rounded-circle mr-3"
                            :title="identity.username"
                            :alt="identity.username"
                          />{{ identity.username }}
                        </button>
                      </div>
                      <div class="dropdown-divider"></div>
                    </div>
                    <a class="dropdown-item" href="/badge/list/">{{
                      T.navViewBadges
                    }}</a>
                    <a class="dropdown-item" href="/profile/#problems">{{
                      T.navProfileProblems
                    }}</a>
                    <a
                      class="dropdown-item"
                      href="/course/#enrolled"
                      data-nav-courses-mine
                      >{{ T.navCoursesEnrolled }}</a
                    >
                    <a
                      class="dropdown-item"
                      href="/arena/?page=1&tab_name=current&sort_order=none&filter=signedup"
                      data-nav-user-contests-enrolled
                      >{{ T.navContestsEnrolled }}</a
                    >
                    <a
                      v-if="!isUnder13User"
                      class="dropdown-item"
                      href="/dependents"
                      >{{ T.navDependents }}</a
                    >
                    <form v-if="!isUnder13User" class="collapse-submenu">
                      <div class="btn-group">
                        <a
                          class="dropdown-item"
                          href="/profile/#created-content"
                          >{{ T.navMyContent }}</a
                        >
                        <button
                          type="button"
                          class="btn dropdown-item dropdown-toggle dropdown-toggle-split"
                          data-toggle="collapse"
                          data-target=".collapse-links"
                          aria-expanded="false"
                          aria-controls="collapse-links"
                        ></button>
                      </div>
                      <div class="collapse collapse-links pl-3">
                        <a class="dropdown-item" href="/problem/mine">{{
                          T.navMyProblems
                        }}</a>
                        <a
                          class="dropdown-item"
                          href="/course/mine"
                          data-nav-courses-mine
                          >{{ T.navMyCourses }}</a
                        >
                        <a
                          class="dropdown-item"
                          href="/contest/mine"
                          data-nav-user-contests
                          >{{ T.navMyContests }}</a
                        >
                      </div>
                    </form>

                    <a
                      class="dropdown-item"
                      href="/group/"
                      data-nav-user-groups
                      >{{ T.navMyGroups }}</a
                    >
                    <a
                      class="dropdown-item"
                      href="/teamsgroup/"
                      data-nav-user-teams-groups
                      >{{ T.navMyTeamsGroups }}</a
                    >
                    <a class="dropdown-item" href="/nomination/mine/">{{
                      T.navMyQualityNomination
                    }}</a>
                  </template>
                  <div class="dropdown-divider"></div>
                  <!-- Logout button for desktop - navbar menu -->
                  <a
                    class="dropdown-item"
                    href="#"
                    data-logout-button
                    @click.prevent="logoutModalVisible = true"
                  >
                    <FontAwesomeIcon :icon="['fas', 'power-off']" />
                    {{ T.omegaupTitleLogout }}
                  </a>
                  <OmegaupCommonGraderStatus
                    v-show="isAdmin"
                    :status="errorMessage !== null ? 'down' : 'ok'"
                    :error="errorMessage"
                    :grader-info="graderInfo"
                  ></OmegaupCommonGraderStatus>
                </div>
              </li>
            </ul>

            <!-- Logout button for mobile -->
            <a
              v-if="isLoggedIn"
              class="navbar justify-content-end d-lg-none align-items-start pt-4 d-flex align-items-center"
              href="#"
              @click.prevent="logoutModalVisible = true"
            >
              <FontAwesomeIcon :icon="['fas', 'power-off']" />
              <span class="ml-2">
                {{ T.omegaupTitleLogout }}
              </span>
            </a>
          </div>
        </div>

        <!-- Logout button for desktop - navbar -->
        <a
          v-if="isLoggedIn"
          class="navbar justify-content-end d-none d-lg-block order-1 align-items-center"
          href="#"
          :title="T.omegaupTitleLogout"
          @click.prevent="logoutModalVisible = true"
        >
          <FontAwesomeIcon :icon="['fas', 'power-off']" />
        </a>
      </div>
    </nav>
    <div v-if="userVerificationDeadline" class="py-2 mt-2" :class="bannerColor">
      <div class="container-xl">
        {{
          daysUntilVerificationDeadline > 1
            ? ui.formatString(T.bannerVerifyAccount, {
                days: daysUntilVerificationDeadline,
              })
            : T.bannerLastDayToVerifyAccount
        }}
      </div>
    </div>
    <template v-if="fromLogin">
      <OmegaupUserObjectivesQuestions
        v-if="isLoggedIn && isMainUserIdentity && userTypes.length === 0"
        @submit="(objectives) => emit('update-user-objectives', objectives)"
      ></OmegaupUserObjectivesQuestions>
      <OmegaupUserNextRegisteredContest
        v-if="isLoggedIn && nextRegisteredContest !== null"
        :next-registered-contest="nextRegisteredContest"
        @redirect="(alias) => emit('redirect-next-registered-contest', alias)"
      ></OmegaupUserNextRegisteredContest>
      <div
        v-if="mentorCanChooseCoder"
        class="alert alert-info alert-dismissible fade show mentor-can-choose-coder"
        role="alert"
      >
        <button type="button" class="close" data-dismiss="alert">
          &times;
        </button>
        <OmegaupMarkdown
          :markdown="T.coderOfTheMonthCanBeChosenManually"
        ></OmegaupMarkdown>
      </div>
    </template>
    <OmegaupLogoutConfirmation v-model="logoutModalVisible">
    </OmegaupLogoutConfirmation>
  </header>
</template>

<script lang="ts">
import eventBus from '../../eventBus';
export { eventBus as EventBus };
export default {};
</script>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { types } from '../../api_types';
import T from '../../lang';
import * as ui from '../../ui';
import eventBus from '../../eventBus';
import OmegaupNotificationsClarifications from '../notification/Clarifications.vue';
import OmegaupNotificationList from '../notification/List.vue';
import OmegaupMarkdown from '../Markdown.vue';
import OmegaupCommonGraderStatus from '../common/GraderStatus.vue';
import OmegaupCommonGraderBadge from '../common/GraderBadge.vue';
import OmegaupUserObjectivesQuestions from '../user/ObjectivesQuestions.vue';
import OmegaupUserNextRegisteredContest from '../user/NextRegisteredContest.vue';
import OmegaupNavbarItems from './NavbarItems.vue';
import { AvailableTabs } from '../login/Signin.vue';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faSignOutAlt, faUser } from '@fortawesome/free-solid-svg-icons';
import OmegaupLogoutConfirmation from './LogoutConfirmation.vue';
library.add(faSignOutAlt, faUser);

const props = withDefaults(
  defineProps<{
    omegaUpLockDown: boolean;
    inContest: boolean;
    isLoggedIn: boolean;
    isReviewer: boolean;
    gravatarURL51: string;
    gravatarURL128: string;
    associatedIdentities: types.AssociatedIdentity[];
    currentEmail: string;
    currentName: string;
    currentUsername: string;
    isAdmin: boolean;
    isMainUserIdentity: boolean;
    lockDownImage: string;
    navbarSection: string;
    notifications: types.Notification[];
    graderInfo: types.GraderStatus | null;
    graderQueueLength: number;
    errorMessage: string | null;
    profileProgress?: number;
    clarifications: types.Clarification[];
    fromLogin: boolean;
    userTypes: string[];
    nextRegisteredContest: types.ContestListItem | null;
    isUnder13User: boolean;
    mentorCanChooseCoder: boolean;
    userVerificationDeadline: Date | null;
  }>(),
  {
    profileProgress: 0,
  },
);

const emit = defineEmits<{
  (
    e: 'read-notifications',
    notifications: types.Notification[],
    url?: string,
  ): void;
  (e: 'change-account', username: string): void;
  (e: 'update-user-objectives', objectives: unknown): void;
  (e: 'redirect-next-registered-contest', alias: string): void;
}>();

const logoutModalVisible = ref(false);

const teachingUserTypes = ['teacher', 'coach', 'independent-teacher'];
const hasTeachingObjective = teachingUserTypes.some((teachingType) =>
  props.userTypes.includes(teachingType),
);

const formattedLoginURL = computed((): string => {
  let path = window.location.pathname;
  if (path === '/login' || path === '/login/') {
    path = '/';
  }
  return `/login/?redirect=${encodeURIComponent(path)}#login`;
});

const formattedSignupURL = computed((): string => {
  let path = window.location.pathname;
  if (path === '/login' || path === '/login/') {
    path = '/';
  }
  return `/login/?redirect=${encodeURIComponent(path)}#signup`;
});

const identitiesNotLoggedIn = computed((): types.AssociatedIdentity[] => {
  return props.associatedIdentities.filter(
    (identity) => identity.username !== props.currentUsername,
  );
});

const daysUntilVerificationDeadline = computed((): number | null => {
  if (!props.userVerificationDeadline) {
    return null;
  }
  const today = new Date();
  const deadline = new Date(props.userVerificationDeadline);
  const timeDifference = deadline.getTime() - today.getTime();
  const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
  return daysDifference;
});

const bannerColor = computed(() => {
  if (
    daysUntilVerificationDeadline.value !== null &&
    daysUntilVerificationDeadline.value <= 1
  ) {
    return 'bg-danger';
  }
  return 'bg-warning';
});

function readNotifications(
  notifications: types.Notification[],
  url?: string,
): void {
  emit('read-notifications', notifications, url);
}

function emitActiveTab(tab: AvailableTabs): void {
  eventBus.emit('update:activeTab', tab);
  if (
    window.location.pathname === '/login' ||
    window.location.pathname === '/login/'
  ) {
    window.location.hash = `#${tab}`;
  } else {
    window.location.href =
      tab === AvailableTabs.Login
        ? formattedLoginURL.value
        : formattedSignupURL.value;
  }
}
</script>

<style lang="scss">
@import '../../../../sass/main.scss';

.mentor-can-choose-coder {
  margin: 1rem;
}

.navbar-color .navbar-toggler {
  color: var(--header-navbar-primary-link-color);
  border-color: var(--header-navbar-primary-link-color);
}

.navbar-color .navbar-toggler-icon {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'%3e%3cpath stroke='rgba%28255, 255, 255, 0.5%29' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
}

.nav-item-align {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

nav.navbar {
  background-color: var(--header-primary-color);

  .navbar-brand {
    background-color: var(--header-navbar-brand-background-color);
  }

  .navbar-brand img {
    transition: transform 0.3s ease;
  }

  .navbar-brand:hover img {
    transform: scale(1.08);
  }

  .navbar-nav .nav-link {
    transition: background-color 0.2s ease;
    border-radius: 4px;
  }

  .navbar-nav .nav-link:hover {
    background-color: var(--header-navbar-hover-background-color);
    text-decoration: none;
  }

  .navbar-nav .nav-link:focus:not(:focus-visible) {
    outline: none;
    box-shadow: none;
  }

  .nav-user-link img {
    border-radius: 4px;
    transition: transform 0.25s ease;
  }

  .nav-user-link:hover img {
    transform: scale(1.05);
  }

  a.dropdown-item {
    color: var(--header-navbar-dropdown-item-font-color);
  }

  a,
  span.nav-link {
    color: var(--header-navbar-primary-link-color);
  }

  .collapse-submenu .btn:focus {
    box-shadow: 0 0 0 0;
  }

  .dropdown-menu {
    overflow-y: auto;
    max-height: 75vh;
    scrollbar-width: none;
  }

  a[data-logout-button] {
    transition: background-color 0.2s ease, color 0.2s ease;
    border-radius: 4px;
  }

  a[data-logout-button]:hover {
    background-color: rgba($omegaup-pink, 0.2);
    color: $omegaup-pink !important;
  }

  a[data-logout-button]:hover svg {
    color: $omegaup-pink !important;
  }
}

.navbar-brand {
  padding-bottom: 1.25rem !important;
}

@media (min-width: 992px) {
  .dropdown {
    position: relative;
  }

  .dropdown::before {
    content: '';
    position: absolute;
    top: 100%;
    left: 0;
    height: 10px;
    width: 100%;
  }

  .navbar-nav:not(:has(.dropdown.show)) .dropdown:hover > .dropdown-menu {
    display: block;
  }

  .navbar-right:not(:has(.dropdown.show)) .dropdown:hover > .dropdown-menu {
    display: block;
  }

  .dropdown.show > .dropdown-menu {
    display: block !important;
  }

  .navbar-collapse:has(.dropdown.show)
    .dropdown:not(.show):hover
    > .dropdown-menu {
    display: none !important;
  }

  .nav-problems .collapse-links {
    display: none;
  }

  .nav-problems .collapse-submenu:is(:hover, :focus-within) .collapse-links {
    display: block;
  }

  .nav-user .collapse-links {
    display: none;
  }

  .nav-user .collapse-submenu:is(:hover, :focus-within) .collapse-links {
    display: block;
  }
}

.progress {
  position: relative;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 11px;
  font-weight: 600;
  color: var(--header-navbar-dropdown-item-font-color);
  pointer-events: none;
}

.allow-overflow {
  overflow-y: auto;
  max-height: 65vh;
  max-width: min(90vw, 420px);
}

.nav-login-text {
  font-size: 14px;
  padding: auto;
}

.navbar-nav {
  .nav-item {
    width: 100% !important;
  }
}

.fullwidth-mobile-fit-lg {
  width: 100%;
}

.username {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 20vw;
  display: inline-block;
  vertical-align: middle;
}

@media (min-width: 992px) {
  .fullwidth-mobile-fit-lg {
    width: fit-content;
  }
}

@media only screen and (min-width: 385px) {
  .nav-login-text {
    font-size: inherit;
    padding: 0.5rem;
  }
}

@media only screen and (max-width: 992px) {
  .allow-overflow {
    max-height: 45vh;
    max-width: 80vw;
  }
}
</style>
