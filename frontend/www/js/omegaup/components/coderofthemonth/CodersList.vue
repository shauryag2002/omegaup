<template>
  <table class="table table-striped table-hover table-responsive-sm">
    <thead>
      <tr>
        <th scope="col" class="text-center"></th>
        <th scope="col" class="text-center">
          {{ T.codersOfTheMonthUser }}
        </th>
        <th scope="col" class="text-center">
          {{ T.codersOfTheMonthCountry }}
        </th>
        <th scope="col" class="text-center">
          {{ T.codersOfTheMonthDate }}
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
        <td class="text-center align-middle">
          {{ coder.date }}
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

defineProps<{
  coders: types.CoderOfTheMonthList[];
}>();
</script>
