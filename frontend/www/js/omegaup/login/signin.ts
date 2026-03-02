import { OmegaUp } from '../omegaup';
import { types } from '../api_types';
import * as api from '../api';
import * as ui from '../ui';
import T from '../lang';
import { createApp, h, reactive } from 'vue';
import login_Signin, { AvailableTabs } from '../components/login/Signin.vue';
import eventBus from '../eventBus';

OmegaUp.on('ready', () => {
  function loginAndRedirect(
    usernameOrEmail: string,
    password: string,
    isAccountCreation: boolean,
  ): void {
    api.User.login({
      usernameOrEmail: usernameOrEmail,
      password: password,
    })
      .then(() => {
        redirect(isAccountCreation);
      })
      .catch(ui.apiError);
  }

  function redirect(isAccountCreation: boolean): void {
    const params = new URLSearchParams(window.location.search);
    const pathname = params.get('redirect');
    const fromLoginParam = '?fromLogin';

    if (isAccountCreation) {
      window.location.href = `/profile/${fromLoginParam}`;
      return;
    }

    if (pathname && pathname.indexOf('/') === 0) {
      window.location.href = pathname + '?fromLogin';
      return;
    }

    if (pathname && pathname.indexOf(document.location.origin) === 0) {
      window.location.href = pathname;
      return;
    }

    window.location.href = `/${fromLoginParam}`;
  }

  const payload = types.payloadParsers.LoginDetailsPayload();
  const urlParams = new URLSearchParams(window.location.search);
  const useSignupFormWithBirthDate =
    urlParams.get('useSignupFormWithBirthDate') === 'true';
  const googleClientId = document
    .querySelector('meta[name="google-signin-client_id"]')
    ?.getAttribute('content');
  const githubClientId = payload.githubClientId;
  const githubState = payload.githubState;
  if (payload.statusError) {
    ui.warning(payload.statusError);
  } else if (payload.verifyEmailSuccessfully) {
    ui.success(payload.verifyEmailSuccessfully);
  }

  const locationHash = window.location.hash.substring(1);
  let initialActiveTab: AvailableTabs = AvailableTabs.Login;
  if (locationHash === AvailableTabs.Signup) {
    initialActiveTab = AvailableTabs.Signup;
  }

  const state = reactive({
    initialActiveTab,
  });

  createApp({
    render: () =>
      h(login_Signin, {
        validateRecaptcha: payload.validateRecaptcha,
        facebookUrl: payload.facebookUrl,
        githubClientId,
        githubState,
        googleClientId,
        hasVisitedSection: payload.hasVisitedSection,
        useSignupFormWithBirthDate,
        initialActiveTab: state.initialActiveTab,
        onRegisterAndLogin: ({
          over13Checked,
          username,
          email,
          dateOfBirth,
          parentEmail,
          password,
          passwordConfirmation,
          recaptchaResponse,
          termsAndPolicies,
        }: {
          over13Checked: boolean;
          username: string;
          email: string;
          dateOfBirth: Date;
          parentEmail: string;
          password: string;
          passwordConfirmation: string;
          recaptchaResponse: string;
          termsAndPolicies: boolean;
        }) => {
          if (!termsAndPolicies) {
            ui.error(T.privacyPolicyNotAccepted);
            return;
          }
          if (password != passwordConfirmation) {
            ui.error(T.passwordMismatch);
            return;
          }
          if (password.length < 8) {
            ui.error(T.loginPasswordTooShort);
            return;
          }
          if (!useSignupFormWithBirthDate) {
            api.User.create({
              username: username,
              email: email,
              password: password,
              recaptcha: recaptchaResponse,
            })
              .then(() => {
                loginAndRedirect(
                  username,
                  password,
                  /*isAccountCreation=*/ true,
                );
              })
              .catch(ui.apiError);
            return;
          }
          const request: {
            username: string;
            email?: string;
            birth_date: Date;
            parent_email?: string;
            password: string;
            recaptcha: string;
          } = {
            username,
            birth_date: new Date(dateOfBirth),
            password,
            recaptcha: recaptchaResponse,
          };
          if (over13Checked) {
            request.email = email;
          } else {
            request.parent_email = parentEmail;
          }

          api.User.create(request)
            .then(() => {
              loginAndRedirect(username, password, /*isAccountCreation=*/ true);
            })
            .catch(ui.apiError);
        },
        login: (usernameOrEmail: string, password: string) => {
          loginAndRedirect(
            usernameOrEmail,
            password,
            /*isAccountCreation=*/ false,
          );
        },
      }),
  }).mount('#main-container');

  const onActiveTab = (tab: string): void => {
    state.initialActiveTab = tab as AvailableTabs;
    window.location.hash = `#${tab}`;
  };
  eventBus.on('update:activeTab', onActiveTab);
});
