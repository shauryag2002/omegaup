<template>
  <div class="col mb-3">
    <div class="card">
      <div class="row no-gutters">
        <div class="col-sm-2 col-lg-3" :class="`${type}-course-card`"></div>
        <div class="col-sm-10 col-lg-9">
          <div class="card-body">
            <h5 class="card-title text-trimmed">{{ course.name }}</h5>
            <OmegaupMarkdown
              v-if="type === CourseType.Public"
              class="card-long-text"
              :markdown="course.description"
            />
            <OmegaupMarkdown
              v-if="type !== CourseType.Finished"
              class="card-text text-trimmed"
              :markdown="
                ui.formatString(T.courseCardImpartedBy, {
                  school_name: course.school_name,
                })
              "
            />
            <div
              v-if="type === CourseType.Student"
              class="row no-gutters justify-content-start align-items-center mb-4"
            >
              <div class="col-4">{{ T.wordsProgress }}:</div>
              <div class="col-8 mt-1">
                <div class="progress">
                  <div
                    class="progress-bar progress-bar-striped bg-warning text-dark"
                    role="progressbar"
                    :style="`width: ${course.progress}%`"
                    :aria-valuenow="course.progress"
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    {{ `${course.progress}%` }}
                  </div>
                </div>
              </div>
            </div>
            <div
              v-if="type === CourseType.Finished"
              class="text-center mb-4 course-star"
            >
              ⭐
            </div>
            <div class="text-center mt-1">
              <a
                class="btn btn-primary text-white"
                role="button"
                :href="`/course/${course.alias}/`"
                >{{ buttonMessage }}</a
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export enum CourseType {
  Finished = 'finished',
  Public = 'public',
  Student = 'student',
}
</script>

<script setup lang="ts">
import { computed } from 'vue';
import { types } from '../../api_types';
import T from '../../lang';
import * as ui from '../../ui';
import OmegaupMarkdown from '../Markdown.vue';

const props = defineProps<{
  course: types.FilteredCourse;
  type: CourseType;
}>();

const buttonMessage = computed((): string => {
  switch (props.type) {
    case CourseType.Finished:
      return T.wordsSeeCourse;
    case CourseType.Student:
      return T.courseCardCourseResume;
    case CourseType.Public:
      return T.wordsStart;
  }
  return T.courseCardCourseResume;
});
</script>

<style lang="scss" scoped>
@import '../../../../sass/main.scss';

.card > .row.no-gutters {
  background-color: $omegaup-white;

  .text-trimmed {
    height: 50px;
    overflow-y: hidden;
  }

  .public-course-card {
    background-color: $omegaup-blue;
  }

  .student-course-card {
    background-color: $omegaup-pink--lighter;
  }

  .finished-course-card {
    background-color: $omegaup-grey--lighter;
  }

  .card-long-text {
    overflow-y: scroll;
    max-height: 250px;
  }
}

.course-star {
  font-size: 3rem;
}
</style>
