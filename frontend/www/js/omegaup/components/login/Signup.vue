<template>
  <div class="card">
    <div class="card-header">
      <h2 class="card-title">{{ T.loginSignupHeader }}</h2>
    </div>
    <div class="card-body">
      <form v-if="!useSignupFormWithBirthDate">
        <div class="row justify-content-md-center">
          <div class="col-md-4 col-md-offset-2 introjs-username">
            <div class="form-group">
              <label class="control-label">{{ T.loginAccountName }}</label>
              <input
                v-model="username"
                data-signup-username
                name="reg_username"
                class="form-control"
                autocomplete="username"
              />
            </div>
          </div>
          <div class="col-md-4 introjs-email">
            <div class="form-group">
              <label class="control-label">{{ T.loginEmail }}</label>
              <input
                v-model="email"
                data-signup-email
                name="reg_email"
                type="email"
                class="form-control"
                autocomplete="email"
              />
            </div>
          </div>
        </div>
        <div class="row justify-content-md-center">
          <div class="col-md-4 col-md-offset-2 introjs-password">
            <div class="form-group">
              <label class="control-label">{{ T.loginPasswordCreate }}</label>
              <omegaup-password-input
                v-model="password"
                data-signup-password
                name="reg_password"
                autocomplete="new-password"
              />
            </div>
          </div>
          <div class="col-md-4 introjs-confirmpassword">
            <div class="form-group">
              <label class="control-label">{{ T.loginRepeatPassword }}</label>
              <omegaup-password-input
                v-model="passwordConfirmation"
                data-signup-repeat-password
                name="reg_password_confirmation"
                autocomplete="new-password"
              />
            </div>
          </div>
        </div>

        <div class="row justify-content-md-center">
          <!-- id-lint off -->
          <div class="col-md-8 introjs-terms-and-conditions">
            <div class="checkbox-wrapper">
              <input
                id="accept-privacy-policy"
                v-model="privacyPolicyAccepted"
                data-signup-accept-policies
                type="checkbox"
                required
              />
              <label for="accept-privacy-policy" class="pl-1">
                <omegaup-markdown
                  :markdown="formattedAcceptPolicyMarkdown"
                ></omegaup-markdown>
              </label>
            </div>
            <div class="checkbox-wrapper">
              <input
                id="accept-code-of-conduct"
                v-model="codeOfConductAccepted"
                data-signup-accept-conduct
                type="checkbox"
                required
              />
              <label for="accept-code-of-conduct" class="pl-1">
                <omegaup-markdown
                  :markdown="formattedAcceptConductMarkdown"
                ></omegaup-markdown>
              </label>
            </div>
          </div>
          <!-- id-lint on -->
          <div v-if="validateRecaptcha" class="col-md-4">
            <vue-recaptcha
              name="recaptcha"
              sitekey="6LfMqdoSAAAAALS8h-PB_sqY7V4nJjFpGK2jAokS"
              @verify="verify"
              @expired="expired"
            ></vue-recaptcha>
          </div>
          <div class="col-md-4 col-md-offset-6">
            <div class="form-group introjs-register">
              <button
                data-signup-submit
                class="btn btn-primary form-control"
                name="sign_up"
                type="submit"
                @click.prevent="
                  $emit('register-and-login', {
                    username,
                    email,
                    password,
                    passwordConfirmation,
                    recaptchaResponse,
                    termsAndPolicies,
                  })
                "
              >
                {{ T.loginSignUp }}
              </button>
            </div>
          </div>
        </div>
      </form>

      <form v-else>
        <div class="row">
          <div class="col-md-4 offset-md-2">
            <div class="form-group">
              <input
                v-model="over13Checked"
                type="checkbox"
                data-over-thirteen-checkbox
                @change="updateDateRestriction"
              />
              <label for="checkbox" class="pl-1">
                <omegaup-markdown
                  :markdown="T.over13yearsOld"
                ></omegaup-markdown>
              </label>
            </div>
          </div>
        </div>

        <div class="row">
          <div v-if="isUnder13" class="col-md-8 offset-md-2">
            <div class="form-group">
              <label class="control-label">{{ T.loginParentEmail }}</label>
              <input
                v-model="parentEmail"
                name="reg_parent_email"
                type="email"
                class="form-control"
                autocomplete="parent-email"
              />
            </div>
          </div>
          <div v-else class="col-md-8 offset-md-2 introjs-email">
            <div class="form-group">
              <label class="control-label">{{ T.loginEmail }}</label>
              <input
                v-model="email"
                data-signup-email
                name="reg_email"
                type="email"
                class="form-control"
                autocomplete="email"
              />
            </div>
          </div>
        </div>
        <div class="row justify-content-md-center">
          <div class="col-md-4 col-md-offset-2 introjs-username">
            <div class="form-group">
              <label class="control-label">{{ T.loginAccountName }}</label>
              <input
                v-model="username"
                data-signup-username
                name="reg_username"
                class="form-control"
                autocomplete="username"
              />
            </div>
          </div>
          <div class="col-md-4">
            <div class="form-group">
              <label class="control-label">{{ T.loginDateOfBirth }}</label>
              <input
                v-model="dateOfBirth"
                name="reg_date_of_birth"
                type="date"
                class="form-control"
                autocomplete="date-of-birth"
                :max="maxDateForTimepicker"
                :min="minDateForTimepicker"
              />
            </div>
          </div>
        </div>
        <div class="row justify-content-md-center">
          <div class="col-md-4 col-md-offset-2 introjs-password">
            <div class="form-group">
              <label class="control-label">{{ T.loginPasswordCreate }}</label>
              <omegaup-password-input
                v-model="password"
                data-signup-password
                name="reg_password"
                autocomplete="new-password"
              />
            </div>
          </div>
          <div class="col-md-4 introjs-confirmpassword">
            <div class="form-group">
              <label class="control-label">{{ T.loginRepeatPassword }}</label>
              <omegaup-password-input
                v-model="passwordConfirmation"
                data-signup-repeat-password
                name="reg_password_confirmation"
                autocomplete="new-password"
              />
            </div>
          </div>
        </div>

        <div class="row justify-content-md-center">
          <!-- id-lint off -->
          <div class="col-md-10 introjs-terms-and-conditions">
            <div class="checkbox-wrapper">
              <input
                id="accept-privacy-policy-birthdate"
                v-model="privacyPolicyAccepted"
                data-signup-accept-policies
                type="checkbox"
              />
              <label for="accept-privacy-policy-birthdate" class="pl-1">
                <omegaup-markdown
                  :markdown="formattedAcceptPolicyMarkdown"
                ></omegaup-markdown>
              </label>
            </div>
            <div class="checkbox-wrapper">
              <input
                id="accept-code-of-conduct-birthdate"
                v-model="codeOfConductAccepted"
                data-signup-accept-conduct
                type="checkbox"
              />
              <label for="accept-code-of-conduct-birthdate" class="pl-1">
                <omegaup-markdown
                  :markdown="formattedAcceptConductMarkdown"
                ></omegaup-markdown>
              </label>
            </div>
          </div>
          <!-- id-lint on -->
        </div>

        <div class="row justify-content-md-center">
          <div v-if="validateRecaptcha" class="col-md-4">
            <vue-recaptcha
              name="recaptcha"
              sitekey="6LfMqdoSAAAAALS8h-PB_sqY7V4nJjFpGK2jAokS"
              @verify="verify"
              @expired="expired"
            ></vue-recaptcha>
          </div>
        </div>

        <div class="row justify-content-md-center">
          <div class="col-md-4 col-md-offset-6">
            <div class="form-group introjs-register">
              <button
                data-signup-submit
                class="btn btn-primary form-control"
                name="sign_up"
                @click.prevent="
                  $emit('register-and-login', {
                    over13Checked,
                    username,
                    email,
                    dateOfBirth,
                    parentEmail,
                    password,
                    passwordConfirmation,
                    recaptchaResponse,
                    termsAndPolicies,
                  })
                "
              >
                {{ T.loginSignUp }}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
  watch,
  onMounted,
  nextTick,
} from 'vue';
import omegaup_Markdown from '../Markdown.vue';
import T from '../../lang';
import * as ui from '../../ui';
import 'intro.js/introjs.css';
import introJs from 'intro.js';
import { getCookie, setCookie } from '../../cookies';
import { getBlogUrl } from '../../urlHelper';
import omegaup_PasswordInput from '../common/PasswordInput.vue';
import { VueRecaptcha } from 'vue-recaptcha';

export default defineComponent({
  name: 'Signup',
  components: {
    'omegaup-markdown': omegaup_Markdown,
    'omegaup-password-input': omegaup_PasswordInput,
    'vue-recaptcha': VueRecaptcha,
  },
  props: {
    validateRecaptcha: { type: Boolean, required: true },
    hasVisitedSection: { type: Boolean, default: false },
    useSignupFormWithBirthDate: { type: Boolean, default: false },
    activeTab: { type: String, default: 'login' },
  },
  emits: ['register-and-login'],
  setup(props) {
    const username = ref('');
    const email = ref('');
    const dateOfBirth = ref('');
    const parentEmail = ref('');
    const password = ref('');
    const passwordConfirmation = ref('');
    const recaptchaResponse = ref('');
    const isUnder13 = ref(true);
    const over13Checked = ref(false);
    const privacyPolicyAccepted = ref(false);
    const codeOfConductAccepted = ref(false);
    const introStarted = ref(false);

    const termsAndPolicies = computed(
      (): boolean => privacyPolicyAccepted.value && codeOfConductAccepted.value,
    );

    const formattedAcceptPolicyMarkdown = computed((): string => {
      const policyUrl = getBlogUrl('PrivacyPolicyURL');
      return ui.formatString(T.acceptPrivacyPolicy, {
        PrivacyPolicyURL: policyUrl,
      });
    });

    const formattedAcceptConductMarkdown = computed((): string => {
      const conductUrl = getBlogUrl('CodeofConductPolicyURL');
      return ui.formatString(T.acceptCodeOfConduct, {
        CodeofConductPolicyURL: conductUrl,
      });
    });

    const maxDateForTimepicker = computed(() => {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = (currentDate.getMonth() + 1)
        .toString()
        .padStart(2, '0');
      const currentDay = currentDate.getDate().toString().padStart(2, '0');

      return over13Checked.value
        ? `${currentYear - 13}-${currentMonth}-${currentDay}`
        : `${currentYear}-${currentMonth}-${currentDay}`;
    });

    const minDateForTimepicker = computed(() => {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = (currentDate.getMonth() + 1)
        .toString()
        .padStart(2, '0');
      const dayFollowingTheCurrent = (currentDate.getDate() + 1)
        .toString()
        .padStart(2, '0');

      return over13Checked.value
        ? '1900-01-01'
        : `${currentYear - 13}-${currentMonth}-${dayFollowingTheCurrent}`;
    });

    function maybeStartIntro(): void {
      if (introStarted.value || props.hasVisitedSection) {
        return;
      }
      if (props.activeTab !== 'signup') {
        return;
      }

      nextTick(() => {
        if (introStarted.value || props.hasVisitedSection) {
          return;
        }
        const title = T.signUpFormInteractiveGuideTitle;
        const steps: Array<{
          title: string;
          intro: string;
          element?: HTMLElement;
        }> = [
          {
            title,
            intro: T.signUpFormInteractiveGuideWelcome,
          },
        ];
        const addStep = (selector: string, intro: string): void => {
          const element = document.querySelector<HTMLElement>(selector);
          if (!element) {
            return;
          }
          steps.push({
            element,
            title,
            intro,
          });
        };

        addStep('.introjs-username', T.signUpFormInteractiveGuideUsername);
        addStep('.introjs-email', T.signUpFormInteractiveGuideEmail);
        addStep('.introjs-password', T.signUpFormInteractiveGuidePassword);
        addStep(
          '.introjs-confirmpassword',
          T.signUpFormInteractiveGuideConfirmPassword,
        );
        addStep(
          '.introjs-terms-and-conditions',
          T.signUpFormInteractiveGuideTermsAndConditions,
        );
        addStep('.introjs-register', T.signUpFormInteractiveGuideRegister);

        if (steps.length <= 1) {
          return;
        }
        introStarted.value = true;
        introJs()
          .setOptions({
            nextLabel: T.interactiveGuideNextButton,
            prevLabel: T.interactiveGuidePreviousButton,
            doneLabel: T.interactiveGuideDoneButton,
            steps,
          })
          .start();
        setCookie('has-visited-signup', true);
      });
    }

    function verify(response: string): void {
      recaptchaResponse.value = response;
    }

    function expired(): void {
      recaptchaResponse.value = '';
    }

    function updateDateRestriction(): void {
      if (over13Checked.value) {
        isUnder13.value = false;
        return;
      }
      isUnder13.value = true;
    }

    onMounted(() => {
      maybeStartIntro();
    });

    watch(
      () => props.activeTab,
      (newValue: string) => {
        if (newValue === 'signup') {
          maybeStartIntro();
        }
      },
    );

    return {
      T,
      ui,
      username,
      email,
      dateOfBirth,
      parentEmail,
      password,
      passwordConfirmation,
      recaptchaResponse,
      isUnder13,
      over13Checked,
      privacyPolicyAccepted,
      codeOfConductAccepted,
      termsAndPolicies,
      formattedAcceptPolicyMarkdown,
      formattedAcceptConductMarkdown,
      maxDateForTimepicker,
      minDateForTimepicker,
      verify,
      expired,
      updateDateRestriction,
    };
  },
});
</script>

<style scoped>
.checkbox-wrapper {
  display: flex;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.checkbox-wrapper input[type='checkbox'] {
  margin-top: 0.35rem;
  flex-shrink: 0;
}

.checkbox-wrapper label {
  word-wrap: break-word;
  overflow-wrap: break-word;
}
</style>
