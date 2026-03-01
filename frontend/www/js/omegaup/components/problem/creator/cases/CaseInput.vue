<template>
  <div class="mt-3">
    <b-form-group
      :description="T.problemCreatorCaseGroupNameHelper"
      :label="T.problemCreatorCaseName"
      label-for="case-name"
      class="mb-4"
    >
      <b-form-input
        v-model="caseName"
        data-problem-creator-case-input="name"
        name="case-name"
        :formatter="formatter"
        required
        autocomplete="off"
      />
    </b-form-group>
    <b-form-group :label="T.problemCreatorGroupName" label-for="case-group">
      <b-form-select v-model="caseGroup" :options="options" name="case-group" />
    </b-form-group>

    <b-form-group
      v-show="!caseAutoPoints"
      :label="T.problemCreatorPoints"
      label-for="case-points"
    >
      <b-form-input
        v-model="casePoints"
        name="case-points"
        :formatter="pointsFormatter"
        type="number"
        number
        min="0"
      />
    </b-form-group>
    <b-form-group
      :label="T.problemCreatorAutomaticPointsRecommended"
      :description="T.problemCreatorAutomaticPointsHelperCase"
    >
      <b-form-checkbox
        :checked="caseAutoPoints"
        name="auto-points"
        @change="toggleAutoPoints"
      >
      </b-form-checkbox>
    </b-form-group>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import store from '../../../../problem/creator/store';
import { NIL } from 'uuid';
import T from '../../../../lang';
import { BFormCheckbox, BFormGroup, BFormInput, BFormSelect } from 'bootstrap-vue-next';

const props = withDefaults(
  defineProps<{
    name?: string;
    group?: string;
    points?: number;
    autoPoints?: boolean;
    editMode?: boolean;
  }>(),
  {
    name: '',
    group: NIL,
    points: 0,
    autoPoints: true,
    editMode: false,
  },
);

const caseName = ref(props.name);
const caseGroup = ref(props.group);
const casePoints = ref<number>(props.points);
const caseAutoPoints = ref<boolean>(props.autoPoints);

// This return the group name, and the group ID of all groups in the store. Matching the required type for the select component./
const storedGroups = computed(
  () =>
    store.getters['casesStore/getGroupIdsAndNames'] as {
      value: string;
      text: string;
    }[],
);

function toggleAutoPoints() {
  caseAutoPoints.value = !caseAutoPoints.value;
  if (caseAutoPoints.value) {
    casePoints.value = 0;
  }
}

// getGroupIdsAndNames getter is not instant, we need to wait for it to be defined otherwise the app will crash
const options = computed(() => {
  const noGroup = { value: NIL, text: T.problemCreatorNoGroup };
  if (!storedGroups.value) {
    return [noGroup];
  }
  if (
    props.editMode &&
    !storedGroups.value.find((group) => group.value === props.group)
  ) {
    caseGroup.value = NIL;
  }
  return [noGroup, ...storedGroups.value];
});

function formatter(text: string) {
  return text.toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '');
}

function pointsFormatter(points: number) {
  return Math.max(points, 0);
}

defineExpose({
  caseName,
  caseGroup,
  casePoints,
  caseAutoPoints,
});
</script>
