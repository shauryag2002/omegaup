<template>
  <figure
    v-tooltip="description"
    class="col-6 col-sm-3 badge-container text-center d-flex flex-column align-items-center"
  >
    <a class="badge-icon d-block w-100" :href="`/badge/${badge.badge_alias}/`">
      <Badge3D>
        <img
          :class="{ 'badge-gray': !badge.unlocked }"
          :src="iconUrl"
          class="img-fluid badge-img"
          :alt="name"
        />
      </Badge3D>
    </a>

    <figcaption class="badge-name pt-2">
      {{ name }}
    </figcaption>
  </figure>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { types } from '../../api_types';
import T from '../../lang';
import 'v-tooltip/dist/v-tooltip.css';
import { VTooltip as vTooltip } from 'v-tooltip';
import Badge3D from './Badge3D.vue';

const props = defineProps<{
  badge: types.Badge;
}>();

const name = computed((): string => {
  return T[`badge_${props.badge.badge_alias}_name`];
});

const description = computed((): string => {
  return T[`badge_${props.badge.badge_alias}_description`];
});

const iconUrl = computed((): string => {
  return `/media/dist/badges/${props.badge.badge_alias}.svg`;
});
</script>

<style lang="scss" scoped>
.badge-gray {
  filter: grayscale(100%);
}

.badge-img {
  max-height: 10rem;
}

.badge-icon {
  position: relative;
  height: 10rem;
}
</style>
