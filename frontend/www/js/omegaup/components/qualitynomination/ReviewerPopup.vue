<template>
  <OmegaupOverlayPopup @dismiss="onHide">
    <transition name="fade">
      <form data-reviewewr-popup class="h-auto w-auto" @submit.prevent="">
        <div class="container-fluid d-flex align-items-start flex-column">
          <template v-if="currentView === AvailableViews.Content">
            <p class="h4 font-weight-bold pb-4 text-center w-100">
              {{ T.reviewerNominationFormTitle }}
            </p>
            <div class="form-group w-100">
              <label class="control-label">
                {{ T.reviewerNominationQuality }}
              </label>
              <br />
              <OmegaupRadioSwitch
                v-model:value="qualitySeal"
                :selected-value="qualitySeal"
              ></OmegaupRadioSwitch>
            </div>
            <div class="form-group w-100" data-other-tag-input>
              <VueTypeaheadBootstrap
                :data="publicTags"
                :serializer="publicTagsSerializer"
                :placeholder="T.collecionOtherTags"
                @hit="addOtherTag"
              >
              </VueTypeaheadBootstrap>
              <br />
              <div class="card-body table-responsive w-100">
                <table class="table table-striped w-100">
                  <thead>
                    <th class="text-center" scope="col">
                      {{ T.contestEditTagName }}
                    </th>
                    <th class="text-center" scope="col">
                      {{ T.contestEditTagDelete }}
                    </th>
                  </thead>
                  <tbody>
                    <tr v-for="tag in publicTagsList" :key="tag">
                      <td data-tag-name>{{ getName(tag) }}</td>
                      <td class="text-center">
                        <button
                          type="button"
                          class="btn btn-danger"
                          :disabled="publicTagsList.length < 2"
                          @click="removeTag(tag)"
                        >
                          <FontAwesomeIcon :icon="['fas', 'trash']" />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="text-right">
              <button
                data-review-submit-button
                class="btn btn-primary mr-3"
                type="submit"
                :disabled="publicTagsList.length === 0"
                @click="onSubmit"
              >
                {{ T.wordsSend }}
              </button>
              <button class="btn btn-secondary" type="button" @click="onHide">
                {{ T.wordsCancel }}
              </button>
            </div>
          </template>
          <template v-if="currentView === AvailableViews.Thanks">
            <div class="w-100 h-100 h3 text-center">
              {{ T.qualityFormThanksForReview }}
            </div>
          </template>
        </div>
      </form>
    </transition>
  </OmegaupOverlayPopup>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import OmegaupOverlayPopup from '../OverlayPopup.vue';
import { AvailableViews } from './DemotionPopup.vue';
import OmegaupRadioSwitch from '../RadioSwitch.vue';
import T from '../../lang';
import VueTypeaheadBootstrap from '../common/TypeaheadBootstrap.vue';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
library.add(faTrash);

interface ProblemTag {
  text: string;
  value: string;
}

const props = withDefaults(
  defineProps<{
    allowUserAddTags: boolean;
    levelTags: string[];
    problemLevel: string;
    possibleTags?: string[];
    publicTags?: string[];
    selectedPublicTags: string[];
    selectedPrivateTags: string[];
    problemAlias: string;
    problemTitle: string;
  }>(),
  {
    possibleTags: () => [
      'problemLevelAdvancedCompetitiveProgramming',
      'problemLevelAdvancedSpecializedTopics',
      'problemLevelBasicIntroductionToProgramming',
      'problemLevelBasicKarel',
      'problemLevelIntermediateAnalysisAndDesignOfAlgorithms',
      'problemLevelIntermediateDataStructuresAndAlgorithms',
      'problemLevelIntermediateMathsInProgramming',
    ],
    publicTags: () => [],
  },
);

const emit = defineEmits<{
  (e: 'dismiss'): void;
  (
    e: 'rate-problem-as-reviewer',
    data: {
      tags: string[];
      qualitySeal: boolean;
    },
  ): void;
}>();

const currentView = ref<AvailableViews>(AvailableViews.Content);
const qualitySeal = ref(true);
const publicTagsList = ref(props.selectedPublicTags ?? []);

const sortedProblemTags = computed((): ProblemTag[] => {
  return props.possibleTags
    .map((x: string): ProblemTag => {
      return {
        value: x,
        text: T[x],
      };
    })
    .sort((a: ProblemTag, b: ProblemTag): number => {
      return a.text.localeCompare(b.text, T.lang);
    });
});

function addOtherTag(tag: string): void {
  if (!publicTagsList.value.includes(tag)) {
    publicTagsList.value.push(tag);
  }
}

function publicTagsSerializer(tagname: string): string {
  if (Object.prototype.hasOwnProperty.call(T, tagname)) {
    return T[tagname];
  }
  return tagname;
}

function getName(alias: string): string {
  return T[alias];
}

function removeTag(name: string) {
  let pos = publicTagsList.value.indexOf(name);
  publicTagsList.value.splice(pos, 1);
}

function onHide(): void {
  emit('dismiss');
}

function onSubmit(): void {
  emit('rate-problem-as-reviewer', {
    tags: publicTagsList.value,
    qualitySeal: qualitySeal.value,
  });
  currentView.value = AvailableViews.Thanks;
  setTimeout(() => onHide(), 2000);
}
</script>

<style lang="scss" scoped>
@import '../../../../sass/main.scss';
ul.tag-select {
  height: 225px;
  overflow: auto;
  border: 1px solid var(--quality-nomination-tag-select-border-color);
  background: var(--quality-nomination-tag-select-background-color);
  list-style-type: none;
}

.tag-label {
  width: -webkit-fill-available;
  margin-bottom: 0;
  padding-bottom: 0.5rem;
}
</style>
