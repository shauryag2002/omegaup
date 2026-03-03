<template>
  <b-modal v-model="showModal" hide-footer>
    <template #modal-title>
      <h5 class="modal-title font-weight-bold">
        {{ T.userObjectivesModalTitle }}
      </h5>
    </template>
    <p class="text-right text-primary">
      {{
        ui.formatString(T.userObjectivesModalPageCounter, {
          current: currentModalPage,
          last: lastModalPage,
        })
      }}
    </p>
    <p class="font-weight-bold">{{ description }}</p>
    <div v-if="currentModalPage === 1" class="mb-3">
      <label class="d-block"
        ><input
          v-model="objective"
          class="mr-3"
          type="radio"
          :value="ObjectivesAnswers.Learning"
        />{{ T.userObjectivesModalAnswerLearning }}</label
      >
      <label class="d-block"
        ><input
          v-model="objective"
          class="mr-3"
          type="radio"
          :value="ObjectivesAnswers.Teaching"
        />{{ T.userObjectivesModalAnswerTeaching }}</label
      >
      <label class="d-block"
        ><input
          v-model="objective"
          class="mr-3"
          type="radio"
          :value="ObjectivesAnswers.LearningAndTeaching"
        />{{ T.userObjectivesModalAnswerLearningAndTeaching }}</label
      >
      <label class="d-block"
        ><input
          v-model="objective"
          class="mr-3"
          type="radio"
          :value="ObjectivesAnswers.None"
        />{{ T.userObjectivesModalAnswerNone }}</label
      >
    </div>
    <div v-else class="mb-3">
      <label class="d-block"
        ><input
          v-model="objective"
          class="mr-3"
          type="radio"
          :value="ObjectivesAnswers.Scholar"
        />{{ T.userObjectivesModalAnswerScholar }}</label
      >
      <label class="d-block"
        ><input
          v-model="objective"
          class="mr-3"
          type="radio"
          :value="ObjectivesAnswers.Competitive"
        />{{ T.userObjectivesModalAnswerCompetitive }}</label
      >
      <label class="d-block"
        ><input
          v-model="objective"
          class="mr-3"
          type="radio"
          :value="ObjectivesAnswers.ScholarAndCompetitive"
        />{{ T.userObjectivesModalAnswerScholarAndCompetitive }}</label
      >
      <label class="d-block"
        ><input
          v-model="objective"
          class="mr-3"
          type="radio"
          :value="ObjectivesAnswers.Other"
        />{{ T.userObjectivesModalAnswerOther }}</label
      >
    </div>
    <button
      v-if="currentModalPage === 1 && objective !== ObjectivesAnswers.None"
      type="button"
      class="btn btn-next-previous float-right pr-0"
      @click="onNextModalPage"
    >
      {{ T.userObjectivesModalButtonNext }}
      <font-awesome-icon class="ml-1" icon="greater-than" />
    </button>
    <div v-else>
      <button
        v-if="objective !== ObjectivesAnswers.None"
        type="button"
        class="btn btn-next-previous float-left pl-0"
        @click="onPreviousModalPage"
      >
        <font-awesome-icon class="mr-1" icon="less-than" />
        {{ T.userObjectivesModalButtonPrevious }}
      </button>
      <button
        type="button"
        class="btn btn-primary float-right w-25"
        data-dismiss="modal"
        @click="onSubmit"
      >
        {{ T.userObjectivesModalButtonSend }}
      </button>
    </div>
  </b-modal>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import T from '../../lang';
import * as ui from '../../ui';

import 'bootstrap-vue-next/dist/bootstrap-vue-next.css';
import { BModal } from 'bootstrap-vue-next';

import {
  FontAwesomeIcon,
  FontAwesomeLayers,
  FontAwesomeLayersText,
} from '@fortawesome/vue-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
library.add(fas);

export enum ObjectivesAnswers {
  Learning = 'learning',
  Teaching = 'teaching',
  LearningAndTeaching = 'learningAndTeaching',
  None = 'none',
  Scholar = 'scholar',
  Competitive = 'competitive',
  ScholarAndCompetitive = 'scholarAndcompetitive',
  Other = 'other',
}

export default defineComponent({
  name: 'UserObjectivesQuestions',
  components: {
    'font-awesome-icon': FontAwesomeIcon,
    'font-awesome-layers': FontAwesomeLayers,
    'font-awesome-layers-text': FontAwesomeLayersText,
  },
  emits: ['submit'],
  setup(props, { emit }) {
    const objective = ref(ObjectivesAnswers.Learning);
    const previousObjective = ref(ObjectivesAnswers.Learning);
    const hasCompetitiveObjective = ref(false);
    const hasLearningObjective = ref(false);
    const hasScholarObjective = ref(false);
    const hasTeachingObjective = ref(false);
    const currentModalPage = ref(1);
    const showModal = ref(true);

    const lastModalPage = computed((): number => {
      if (objective.value !== ObjectivesAnswers.None) {
        return 2;
      }
      return currentModalPage.value;
    });

    const description = computed((): string => {
      if (currentModalPage.value === 1) {
        return T.userObjectivesModalDescriptionUsage;
      }
      if (hasLearningObjective.value && hasTeachingObjective.value) {
        return T.userObjectivesModalDescriptionLearningAndTeaching;
      }
      if (hasLearningObjective.value) {
        return T.userObjectivesModalDescriptionLearning;
      }
      return T.userObjectivesModalDescriptionTeaching;
    });

    function setFirstModalPageObjectives(): void {
      switch (objective.value) {
        case ObjectivesAnswers.Learning:
          hasLearningObjective.value = true;
          hasTeachingObjective.value = false;
          break;
        case ObjectivesAnswers.Teaching:
          hasLearningObjective.value = false;
          hasTeachingObjective.value = true;
          break;
        case ObjectivesAnswers.LearningAndTeaching:
          hasLearningObjective.value = true;
          hasTeachingObjective.value = true;
          break;
        case ObjectivesAnswers.None:
          hasLearningObjective.value = false;
          hasTeachingObjective.value = false;
          break;
      }
    }

    function onNextModalPage(): void {
      setFirstModalPageObjectives();
      previousObjective.value = objective.value;
      objective.value = ObjectivesAnswers.Scholar;
      currentModalPage.value++;
    }

    function onPreviousModalPage(): void {
      objective.value = previousObjective.value;
      currentModalPage.value--;
    }

    function onSubmit(): void {
      if (currentModalPage.value !== 1) {
        switch (objective.value) {
          case ObjectivesAnswers.Scholar:
            hasScholarObjective.value = true;
            hasCompetitiveObjective.value = false;
            break;
          case ObjectivesAnswers.Competitive:
            hasScholarObjective.value = false;
            hasCompetitiveObjective.value = true;
            break;
          case ObjectivesAnswers.ScholarAndCompetitive:
            hasScholarObjective.value = true;
            hasCompetitiveObjective.value = true;
            break;
          case ObjectivesAnswers.Other:
            hasScholarObjective.value = false;
            hasCompetitiveObjective.value = false;
            break;
        }
      } else {
        setFirstModalPageObjectives();
      }

      showModal.value = false;
      emit('submit', {
        hasCompetitiveObjective: hasCompetitiveObjective.value,
        hasLearningObjective: hasLearningObjective.value,
        hasScholarObjective: hasScholarObjective.value,
        hasTeachingObjective: hasTeachingObjective.value,
      });
    }

    return {
      T,
      ui,
      objective,
      previousObjective,
      hasCompetitiveObjective,
      hasLearningObjective,
      hasScholarObjective,
      hasTeachingObjective,
      currentModalPage,
      ObjectivesAnswers,
      showModal,
      lastModalPage,
      description,
      onNextModalPage,
      onPreviousModalPage,
      onSubmit,
    };
  },
});
</script>

<style lang="scss" scoped>
@import '../../../../sass/main.scss';

:deep(.modal-dialog) {
  max-width: 330px;
}

:deep(.modal-header) {
  border-bottom: 0;
}

.btn-next-previous {
  color: var(--btn-next-previous-font-color);
}

.btn-next-previous:focus,
.btn-next-previous.focus {
  box-shadow: 0 0 0 0;
}
</style>
