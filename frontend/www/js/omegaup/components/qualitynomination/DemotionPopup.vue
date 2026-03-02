<template>
  <OmegaupOverlayPopup @dismiss="onHide">
    <transition name="fade">
      <form data-demotion-popup class="h-auto w-auto">
        <template v-if="currentView === AvailableViews.Question">
          <div class="form-group">
            <div class="font-weight-bold pb-4">
              {{ T.reportProblemFormQuestion }}
            </div>
            <select
              v-model="selectedReason"
              class="control-label w-100"
              name="selectedReason"
            >
              <option value="no-problem-statement">
                {{ T.reportProblemFormNotAProblemStatement }}
              </option>
              <option value="poorly-described">
                {{ T.reportProblemFormPoorlyDescribed }}
              </option>
              <option value="offensive">
                {{ T.reportProblemFormOffensive }}
              </option>
              <option value="spam">
                {{ T.reportProblemFormSpam }}
              </option>
              <option value="duplicate">
                {{ T.reportProblemFormDuplicate }}
              </option>
              <option value="wrong-test-cases">
                {{ T.reportProblemFormCases }}
              </option>
              <option value="other">
                {{ T.reportProblemFormOtherReason }}
              </option>
            </select>
          </div>
          <div v-if="selectedReason == 'duplicate'" class="form-group">
            <label class="control-label w-100">{{
              T.reportProblemFormLinkToOriginalProblem
            }}</label>
            <input v-model="original" class="w-100" name="original" />
          </div>
          <div class="form-group">
            <label class="control-label w-100">{{
              T.reportProblemFormAdditionalComments
            }}</label>
            <textarea
              v-model="rationale"
              class="input-text w-100"
              name="rationale"
              type="text"
            ></textarea>
          </div>
          <div class="text-right">
            <button
              data-submit-report-button
              class="col-md-4 btn btn-primary"
              type="submit"
              :disabled="
                !selectedReason ||
                (!rationale && selectedReason == 'other') ||
                (!original && selectedReason == 'duplicate')
              "
              @click.prevent="onSubmit"
            >
              {{ T.wordsSend }}
            </button>
          </div>
        </template>
        <template v-if="currentView === AvailableViews.Thanks">
          <div class="w-100 h-100 h3 text-center">
            <h1>{{ T.reportProblemFormThanksForReview }}</h1>
          </div>
        </template>
      </form>
    </transition>
  </OmegaupOverlayPopup>
</template>

<script lang="ts">
export enum AvailableViews {
  Content,
  Question,
  Thanks,
}
export default {};
</script>

<script setup lang="ts">
import { ref } from 'vue';
import OmegaupOverlayPopup from '../OverlayPopup.vue';
import T from '../../lang';

const rationale = ref('');
const original = ref('');
const currentView = ref(AvailableViews.Question);
const selectedReason = ref('');

const emit = defineEmits<{
  (e: 'dismiss'): void;
  (
    e: 'submit',
    data: {
      rationale: string;
      selectedReason: string;
      original: string;
    },
  ): void;
}>();

function onHide(): void {
  emit('dismiss');
}

function onSubmit(): void {
  emit('submit', {
    rationale: rationale.value,
    selectedReason: selectedReason.value,
    original: original.value,
  });
  currentView.value = AvailableViews.Thanks;
  setTimeout(() => onHide(), 2000);
}
</script>
