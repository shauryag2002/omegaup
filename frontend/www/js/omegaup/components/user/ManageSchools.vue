<template>
  <form role="form" class="card-body" @submit.prevent="onUpdateUserSchools">
    <div class="form-group">
      <label>{{ T.profileSchool }}</label>
      <omegaup-common-typeahead
        :existing-options="searchResultSchools"
        :options="searchResultSchools"
        v-model:value="school"
        data-school-name
        @update-existing-options="
          (query) => $emit('update-search-result-schools', query)
        "
      ></omegaup-common-typeahead>
    </div>
    <div class="form-group">
      <label>{{ T.userEditSchoolGrade }}</label>
      <select v-model="scholarDegree" class="form-control" data-school-grade>
        <option value="none">{{ T.userEditNone }}</option>
        <option value="early_childhood">
          {{ T.userEditEarlyChildhood }}
        </option>
        <option value="pre_primary">{{ T.userEditPrePrimary }}</option>
        <option value="primary">{{ T.userEditPrimary }}</option>
        <option value="lower_secondary">
          {{ T.userEditLowerSecondary }}
        </option>
        <option value="upper_secondary">
          {{ T.userEditUpperSecondary }}
        </option>
        <option value="post_secondary">{{ T.userEditPostSecondary }}</option>
        <option value="tertiary">{{ T.userEditTertiary }}</option>
        <option value="bachelors">{{ T.userEditBachelors }}</option>
        <option value="master">{{ T.userEditMaster }}</option>
        <option value="doctorate">{{ T.userEditDoctorate }}</option>
      </select>
    </div>
    <div class="form-group">
      <label>{{ T.userEditManageSchoolsUserCurrentlyEnrolled }}</label>
      <omegaup-radio-switch
        v-model:value="isCurrentlyEnrolled"
        :selected-value="isCurrentlyEnrolled"
      ></omegaup-radio-switch>
    </div>
    <div class="form-group" data-graduation-date>
      <label>{{ T.userEditGraduationDate }}</label>
      <omegaup-datepicker
        v-model="graduationDate"
        :required="false"
        :enabled="!isCurrentlyEnrolled"
      ></omegaup-datepicker>
    </div>
    <div class="mt-3">
      <button
        type="submit"
        class="btn btn-primary mr-2"
        data-save-school-changes
      >
        {{ T.wordsSaveChanges }}
      </button>
      <a href="/profile/" class="btn btn-cancel">{{ T.wordsCancel }}</a>
    </div>
  </form>
</template>

<script lang="ts">
import { defineComponent, ref, PropType } from 'vue';
import { types } from '../../api_types';
import T from '../../lang';
import * as time from '../../time';
import common_Typeahead from '../common/Typeahead.vue';
import DatePicker from '../DatePicker.vue';
import OmegaupRadioSwitch from '../RadioSwitch.vue';

export default defineComponent({
  name: 'UserManageSchools',
  components: {
    'omegaup-datepicker': DatePicker,
    'omegaup-common-typeahead': common_Typeahead,
    'omegaup-radio-switch': OmegaupRadioSwitch,
  },
  props: {
    profile: {
      type: Object as PropType<types.UserProfileInfo>,
      required: true,
    },
    searchResultSchools: {
      type: Array as PropType<types.SchoolListItem[]>,
      required: true,
    },
  },
  emits: ['update-user-schools'],
  setup(props, { emit }) {
    const graduationDate = ref(
      props.profile.graduation_date
        ? time.convertLocalDateToGMTDate(props.profile.graduation_date)
        : new Date(''),
    );
    const school = ref<null | types.SchoolListItem>(
      props.searchResultSchools[0] ?? null,
    );
    const scholarDegree = ref(props.profile.scholar_degree);
    const isCurrentlyEnrolled = ref(!props.profile.graduation_date);

    function onUpdateUserSchools(): void {
      emit('update-user-schools', {
        graduation_date:
          isCurrentlyEnrolled.value || isNaN(graduationDate.value.getTime())
            ? null
            : graduationDate.value,
        school_id:
          !school.value ||
          (school.value.key === props.profile.school_id &&
            school.value.value !== props.profile.school)
            ? null
            : school.value.key,
        school_name: school.value?.value,
        scholar_degree: scholarDegree.value,
      });
    }

    return {
      T,
      graduationDate,
      school,
      scholarDegree,
      isCurrentlyEnrolled,
      onUpdateUserSchools,
    };
  },
});
</script>
