<template>
  <div class="card">
    <h3 class="card-header mb-0">{{ T.courseListAdminCourses }}</h3>
    <div class="card-body pb-0">
      <div v-if="isMainUserIdentity" class="float-right">
        <a class="btn btn-primary" href="/course/new/">{{ T.courseNew }}</a>
      </div>
    </div>
    <template v-if="courses.admin.activeTab !== ''">
      <OmegaupCourseFilteredList
        :courses="courses.admin"
        :active-tab="courses.admin.activeTab"
        :show-percentage="false"
      ></OmegaupCourseFilteredList>
    </template>
  </div>
</template>

<script setup lang="ts">
import T from '../../lang';
import { types } from '../../api_types';
import * as ui from '../../ui';
import OmegaupCourseFilteredList from './FilteredList.vue';

defineProps<{
  courses: types.AdminCourses;
  isMainUserIdentity: boolean;
}>();
</script>
