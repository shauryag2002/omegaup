import common_Navbar from '../components/common/Navbar.vue';
import { OmegaUp } from '../omegaup';
import * as api from '../api';
import { types } from '../api_types';
import * as ui from '../ui';
import { createApp, h, reactive } from 'vue';
import T from '../lang';
import clarificationsStore from '../arena/clarificationsStore';
import mainStore from '../mainStore';

OmegaUp.on('ready', () => {
  const payload = types.payloadParsers.CommonPayload('header-payload');
  const fromLogin =
    new URL(document.location.toString()).searchParams.get('fromLogin') !==
    null;

  if (fromLogin) {
    const url = new URL(window.location.toString());
    url.searchParams.delete('fromLogin');
    window.history.replaceState({}, document.title, url.toString());
  }

  const commonNavbarExists = document.getElementById('common-navbar');
  if (!commonNavbarExists) {
    return;
  }
  const state = reactive({
    notifications: [] as types.Notification[],
    graderInfo: null as types.GraderStatus | null,
    graderQueueLength: -1,
    errorMessage: null as string | null,
  });

  createApp({
    render: () =>
      h(common_Navbar, {
        omegaUpLockDown: payload.omegaUpLockDown,
        inContest: payload.inContest,
        isLoggedIn: payload.isLoggedIn,
        isReviewer: payload.isReviewer,
        gravatarURL51: payload.gravatarURL51,
        gravatarURL128: payload.gravatarURL128,
        associatedIdentities: payload.associatedIdentities,
        currentEmail: payload.currentEmail,
        currentName: payload.currentName,
        currentUsername: mainStore.state.username,
        isAdmin: payload.isAdmin,
        isMainUserIdentity: payload.isMainUserIdentity,
        lockDownImage: payload.lockDownImage,
        navbarSection: payload.navbarSection,
        profileProgress: payload.profileProgress,
        notifications: state.notifications,
        graderInfo: state.graderInfo,
        graderQueueLength: state.graderQueueLength,
        errorMessage: state.errorMessage,
        clarifications: clarificationsStore.state.clarifications,
        fromLogin: fromLogin,
        mentorCanChooseCoder: payload.mentorCanChooseCoder,
        userTypes: payload.userTypes,
        nextRegisteredContest: payload.nextRegisteredContestForUser,
        isUnder13User: payload.isUnder13User,
        userVerificationDeadline: payload.userVerificationDeadline,
        onReadNotifications: (
          notifications: types.Notification[],
          redirectTo?: string,
        ) => {
          api.Notification.readNotifications({
            notifications: notifications.map(
              (notification) => notification.notification_id,
            ),
          })
            .then(() => api.Notification.myList())
            .then((data) => {
              state.notifications = data.notifications;
              if (redirectTo) {
                ui.navigateTo(redirectTo);
              }
            })
            .catch(ui.apiError);
        },
        onChangeAccount: (usernameOrEmail: string) => {
          api.Identity.selectIdentity({
            usernameOrEmail: usernameOrEmail,
          })
            .then(() => {
              window.location.reload();
            })
            .catch(ui.apiError);
        },
        onUpdateUserObjectives: ({
          hasCompetitiveObjective,
          hasLearningObjective,
          hasScholarObjective,
          hasTeachingObjective,
        }: {
          hasCompetitiveObjective: string;
          hasLearningObjective: string;
          hasScholarObjective: string;
          hasTeachingObjective: string;
        }) => {
          api.User.update({
            has_competitive_objective: hasCompetitiveObjective,
            has_learning_objective: hasLearningObjective,
            has_scholar_objective: hasScholarObjective,
            has_teaching_objective: hasTeachingObjective,
          })
            .then(() => {
              ui.success(T.userObjectivesUpdateSuccess);
            })
            .catch(ui.apiError);
        },
        onRedirectNextRegisteredContest: (alias: string) => {
          window.location.href = `/arena/${encodeURIComponent(alias)}/`;
        },
      }),
  }).mount('#common-navbar');

  if (payload.isLoggedIn) {
    mainStore.commit('updateUsername', payload.currentUsername);
    api.Notification.myList()
      .then((data) => {
        state.notifications = data.notifications;
      })
      .catch(ui.apiError);
  }

  if (payload.isAdmin) {
    const updateGraderStatus = () => {
      api.Grader.status()
        .then((stats) => {
          state.graderInfo = stats.grader;
          if (stats.grader.queue) {
            state.graderQueueLength =
              stats.grader.queue.run_queue_length +
              stats.grader.queue.running.length;
          }
          state.errorMessage = null;
        })
        .catch((stats) => {
          state.errorMessage = stats.error;
        });
    };

    updateGraderStatus();
    setInterval(updateGraderStatus, 30000);
  }
});
