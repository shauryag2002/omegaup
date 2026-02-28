<template>
  <div class="card h-100">
    <div class="d-flex justify-content-center card-header">
      <h5 class="m-0 mr-1">
        {{ T.schoolOfTheMonth }}
      </h5>
      <a class="card-header-help" :href="NewSchoolofTheMonthFeatureURL">
        <font-awesome-icon :icon="['fas', 'info-circle']" />
      </a>
    </div>
    <div
      class="card-body text-center d-flex flex-column justify-content-center"
    >
      <h5 class="card-title">
        <OmegaupCountryflag
          v-if="schoolOfTheMonth.country_id !== null"
          :country="schoolOfTheMonth.country_id"
          class="mr-1"
        ></OmegaupCountryflag>
        <a :href="`/schools/profile/${schoolOfTheMonth.school_id}/`">{{
          schoolOfTheMonth.name
        }}</a>
      </h5>
      <!-- TODO: agregar más información (logo, total de usuarios...) -->
      <div
        v-if="schoolOfTheMonth.state && schoolOfTheMonth.country"
        class="card-text"
      >
        {{ schoolOfTheMonth.state }}, {{ schoolOfTheMonth.country }}
      </div>
    </div>
    <div class="card-footer text-center">
      <a href="/schoolofthemonth/">{{ T.coderOfTheMonthFullList }}</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { omegaup } from '../../omegaup';
import OmegaupCountryflag from '../CountryFlag.vue';
import T from '../../lang';
import { getBlogUrl } from '../../urlHelper';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
library.add(faInfoCircle);

defineProps<{
  schoolOfTheMonth: omegaup.SchoolOfTheMonth;
}>();

const NewSchoolofTheMonthFeatureURL = computed<string>(() => {
  return getBlogUrl('NewSchoolofTheMonthFeatureURL');
});
</script>

<style lang="scss" scoped>
@import '../../../../sass/main.scss';

.card-header {
  color: $omegaup-white;
  background-color: $omegaup-pink;
}
</style>
