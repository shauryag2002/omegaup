<template>
  <div v-if="isDisabled" class="system-in-maintainance m-5 text-center">
    <OmegaupMarkdown :markdown="T.coderOfTheMonthSystemInMaintainance" />
    <font-awesome-icon :icon="['fas', 'cogs']" />
  </div>
  <table v-else class="table table-striped table-hover table-responsive-sm">
    <thead>
      <tr>
        <th scope="col" class="text-center"></th>
        <th scope="col" class="text-center">
          {{ T.codersOfTheMonthUser }}
        </th>
        <th scope="col" class="text-center">
          {{ T.codersOfTheMonthCountry }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(coder, index) in coders" :key="index">
        <td class="text-center">
          <img :src="coder.gravatar_32" :alt="coder.username" />
        </td>
        <td class="text-center align-middle">
          <OmegaupUserUsername
            :classname="coder.classname"
            :linkify="true"
            :username="coder.username"
          />
        </td>
        <td class="text-center align-middle">
          <OmegaupCountryflag :country="coder.country_id" />
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import T from '../../lang';
import OmegaupUserUsername from '../user/Username.vue';
import OmegaupCountryflag from '../CountryFlag.vue';
import { types } from '../../api_types';

import OmegaupMarkdown from '../Markdown.vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCogs } from '@fortawesome/free-solid-svg-icons';
library.add(faCogs);

withDefaults(
  defineProps<{
    coders: types.CoderOfTheMonthList[];
    selectedTab: string;
    isDisabled?: boolean;
  }>(),
  {
    isDisabled: false,
  },
);
</script>

<style scoped lang="scss">
.system-in-maintainance {
  font-size: 180%;
  color: var(--general-in-maintainance-color);
}
</style>
