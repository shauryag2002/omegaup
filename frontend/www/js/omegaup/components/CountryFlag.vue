<template>
  <span v-if="country && country !== ''" class="pr-1">
    <img
      height="11"
      :src="flagUrl"
      :title="displayTitle"
      alt=""
      aria-hidden="true"
      width="16"
    />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import T from '../lang';

const props = defineProps<{
  country: string;
}>();

const flagUrl = computed((): string => {
  if (!props.country || props.country === '') return '';
  return `/media/flags/${props.country.toLowerCase()}.png`;
});

const displayTitle = computed((): string => {
  if (props.country === 'xx') {
    return T.countryNotSet;
  }
  return props.country;
});
</script>
