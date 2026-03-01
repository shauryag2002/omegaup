<template>
  <div class="omegaup-course-clone card">
    <h2 class="card-header">{{ T.wordsCloneCourse }}</h2>
    <div class="card-body">
      <div class="mb-4">
        <p>
          <span class="font-weight-bold">{{ T.wordsName }}: </span>
          {{ course.name }}
        </p>
        <p>
          <span class="font-weight-bold">{{ T.courseCloneCreatedBy }}: </span>
          <OmegaupUsername
            :classname="classname"
            :username="username"
            :linkify="true"
          ></OmegaupUsername>
        </p>
        <div class="d-flex align-items-baseline">
          <span class="font-weight-bold mr-2 text-nowrap">
            {{ T.wordsDescription }}:
          </span>
          <OmegaupMarkdown
            :full-width="true"
            :markdown="course.description"
            class="flex-grow-1 description-content"
          ></OmegaupMarkdown>
        </div>
        <li
          v-for="assignment of course.assignments"
          :key="assignment.problemset_id"
        >
          {{ assignment.name }}
        </li>
      </div>
      <OmegaupCourseClone
        :initial-alias="aliasWithUsername"
        :initial-name="course.name"
        @clone="
          (alias, name, startTime) =>
            emit('clone', alias, name, token, startTime)
        "
      ></OmegaupCourseClone>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import T from '../../lang';
import { types } from '../../api_types';
import OmegaupCourseClone from './Clone.vue';
import OmegaupUsername from '../user/Username.vue';
import OmegaupMarkdown from '../Markdown.vue';

const props = defineProps<{
  course: types.CourseDetails;
  username: string;
  classname: string;
  token: string;
  currentUsername: string;
}>();

const emit = defineEmits<{
  (
    e: 'clone',
    alias: string,
    name: string,
    token: string,
    startTime: Date,
  ): void;
}>();

const aliasWithUsername = computed(
  () => `${props.course.alias}_${props.currentUsername}`,
);
</script>

<style lang="scss" scoped>
/* Allow flex item to shrink below content size for proper text wrapping */
.description-content {
  min-width: 0;
}

/* stylelint-disable-next-line selector-pseudo-element-no-unknown */
:deep([data-markdown-statement]) {
  word-break: break-word;
  overflow-wrap: break-word;
}

/* stylelint-disable-next-line selector-pseudo-element-no-unknown */
:deep([data-markdown-statement] p) {
  margin-bottom: 0;
  margin-top: 0;
}
</style>
