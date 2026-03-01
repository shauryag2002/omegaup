<template>
  <div class="col mb-3">
    <div class="card">
      <div class="row no-gutters">
        <div class="col-sm-2 enrolled-course-card"></div>
        <div class="col-sm-10">
          <div class="card-body d-flex flex-column h-100">
            <h5 class="card-title mb-0">{{ course.name }}</h5>
            <div
              class="card-text course-data mt-3 h-100 d-flex flex-column justify-content-around"
            >
              <div>
                <OmegaupMarkdown
                  v-if="course.school_name"
                  :full-width="true"
                  :markdown="
                    ui.formatString(T.courseCardImpartedBy, {
                      school_name: course.school_name,
                    })
                  "
                >
                </OmegaupMarkdown>
                <div class="d-flex justify-content-between align-items-center">
                  {{ T.courseCardProgress }}
                  <div class="progress w-75">
                    <div
                      class="progress-bar"
                      role="progressbar"
                      :aria-valuenow="course.progress"
                      aria-valuemin="0"
                      aria-valuemax="100"
                      :style="`width: ${course.progress}%`"
                    ></div>
                  </div>
                </div>
              </div>
              <div class="text-center mt-1">
                <a
                  class="btn btn-primary text-white"
                  role="button"
                  :href="`/course/${course.alias}/`"
                  >{{ T.courseCardCourseResume }}</a
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { types } from '../../api_types';
import T from '../../lang';
import * as ui from '../../ui';

import OmegaupMarkdown from '../Markdown.vue';

defineProps<{
  course: types.CourseCardEnrolled;
}>();
</script>
