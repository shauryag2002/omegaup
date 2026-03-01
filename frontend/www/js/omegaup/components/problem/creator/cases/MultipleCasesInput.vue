<template>
  <div class="mt-3">
    <b-row>
      <b-col>
        <b-form-group
          data-prefix
          :label="T.problemCreatorPrefix"
          label-for="prefix"
          invalid-feedback="Solo numeros"
          class="mb-4"
        >
          <b-form-input
            v-model="multipleCasesPrefix"
            data-problem-creator-multiple-cases-input="prefix"
            lazy-formatter
            :formatter="formatter"
            name="multiple-cases-prefix"
            autocomplete="off"
          />
        </b-form-group>
      </b-col>
      <b-col>
        <b-form-group
          :label="T.problemCreatorSuffix"
          label-for="suffix"
          class="mb-4"
        >
          <b-form-input
            v-model="multipleCasesSuffix"
            data-problem-creator-multiple-cases-input="suffix"
            lazy-formatter
            :formatter="formatter"
            name="multiple-cases-suffix"
            autocomplete="off"
          />
        </b-form-group>
      </b-col>
    </b-row>
    <b-form-group
      :label="T.problemCreatorNumberOfCases"
      :description="`${T.problemCreatorNumberOfCasesHelper} ${caseNamePreview}`"
      label-for="case-points"
    >
      <b-form-input
        v-model="multipleCasesCount"
        data-problem-creator-multiple-cases-input="count"
        lazy-formatter
        :formatter="numberFormatter"
        name="multiple-cases-count"
        type="number"
        number
      />
    </b-form-group>
    <b-form-group :label="T.problemCreatorGroupName" label-for="case-group">
      <b-form-select
        v-model="multipleCasesGroup"
        :options="options"
        name="multiple-cases-group"
      />
    </b-form-group>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import store from '../../../../problem/creator/store';
import { GroupID } from '../../../../problem/creator/types';
import { NIL } from 'uuid';
import T from '../../../../lang';
import { BCol, BFormGroup, BFormInput, BFormSelect, BRow } from 'bootstrap-vue-next';

const multipleCasesPrefix = ref('');
const multipleCasesSuffix = ref('');
const multipleCasesCount = ref(1);
const multipleCasesGroup = ref<GroupID>(NIL);

const storedGroups = computed(
  () =>
    store.getters['casesStore/getGroupIdsAndNames'] as {
      value: string;
      text: string;
    }[],
);

const options = computed(() => {
  const noGroup = { value: NIL, text: T.problemCreatorNoGroup };
  if (!storedGroups.value) {
    return [noGroup];
  }
  return [noGroup, ...storedGroups.value];
});

const caseNamePreview = computed(() => {
  return `${formatter(multipleCasesPrefix.value)}1${formatter(
    multipleCasesSuffix.value,
  )}, ${formatter(multipleCasesPrefix.value)}2${formatter(
    multipleCasesSuffix.value,
  )}...`;
});

// Ensure that the prefix and suffix always contain alphanumeric characters in addition to _ and -
function formatter(text: string) {
  return text.toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '');
}

// Ensures the number is always above 1
function numberFormatter(number: number) {
  return Math.max(number, 1);
}

defineExpose({
  multipleCasesPrefix,
  multipleCasesSuffix,
  multipleCasesCount,
  multipleCasesGroup,
});
</script>
