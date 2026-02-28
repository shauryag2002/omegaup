<template>
  <div class="mt-3">
    <b-form-group
      :description="T.problemCreatorCaseGroupNameHelper"
      :label="T.problemCreatorGroupName"
      label-for="case-name"
      class="mb-4"
    >
      <b-form-input
        v-model="groupName"
        data-problem-creator-group-input="name"
        :formatter="formatter"
        required
        autocomplete="off"
        name="group-name"
      />
    </b-form-group>
    <b-form-group
      v-show="!groupAutoPoints"
      :label="T.problemCreatorPoints"
      label-for="case-points"
    >
      <b-form-input
        v-model="groupPoints"
        name="group-points"
        :formatter="pointsFormatter"
        type="number"
        number
        min="0"
      />
    </b-form-group>
    <b-form-group
      :label="T.problemCreatorAutomaticPoints"
      :description="T.problemCreatorAutomaticPointsHelperGroup"
    >
      <b-form-checkbox
        :checked="groupAutoPoints"
        name="group-auto-points"
        @change="toggleGroupAutoPoints"
      >
      </b-form-checkbox>
    </b-form-group>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import T from '../../../../lang';

const props = withDefaults(
  defineProps<{
    name?: string;
    points?: number;
    autoPoints?: boolean;
  }>(),
  {
    name: '',
    points: 100,
    autoPoints: true,
  },
);

const groupName = ref(props.name);
const groupPoints = ref<number>(props.points);
const groupAutoPoints = ref<boolean>(props.autoPoints);

function formatter(text: string) {
  return text.toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '');
}

function pointsFormatter(points: number) {
  return Math.max(points, 0);
}

function toggleGroupAutoPoints() {
  groupAutoPoints.value = !groupAutoPoints.value;
  if (groupAutoPoints.value) {
    groupPoints.value = 100;
  }
}

defineExpose({
  groupName,
  groupPoints,
  groupAutoPoints,
});
</script>
