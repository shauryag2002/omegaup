<template>
  <div class="container-lg p-5">
    <h1 class="text-center">{{ name }}</h1>
    <figure
      class="px-2 py-4 row justify-content-center align-items-center text-center"
    >
      <div class="col-lg-6 d-flex justify-content-center">
        <Badge3D class="badge-icon-wrapper">
          <img
            :class="{ 'badge-icon-gray': !badge.assignation_time }"
            :src="iconUrl"
            :alt="name"
            class="badge-icon-img"
          />
        </Badge3D>
      </div>
      <figcaption class="col-lg-6 p-0 mt-4 mt-lg-0 badge-description">
        {{ description }}
      </figcaption>
    </figure>
    <div class="row justify-content-center align-items-center text-center">
      <div class="col-sm-6 col-md-4">
        <div class="font-weight-bold badge-data">
          {{ ownersNumber }}
        </div>
        <div class="badge-text">
          <span class="badge-text-icon">👥</span>
          {{ T.badgeOwnersMessage }}
        </div>
      </div>
      <div class="col-sm-6 col-md-4 mt-3 mt-md-0">
        <div class="font-weight-bold badge-data">
          {{ firstAssignationDate }}
        </div>
        <div class="badge-text">
          <span class="badge-text-icon">📅</span>
          {{ T.badgeFirstAssignationMessage }}
        </div>
      </div>
      <div class="col-sm-6 col-md-4 mt-3 mt-md-0">
        <div class="font-weight-bold badge-data">
          {{ assignationDate }}
        </div>
        <div class="badge-text">
          <OmegaupMarkdown :markdown="ownedMessage"></OmegaupMarkdown>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { types } from '../../api_types';
import T from '../../lang';
import * as time from '../../time';
import OmegaupMarkdown from '../Markdown.vue';
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

const ownedMessage = computed((): string => {
  return props.badge.assignation_time
    ? `<span class="badge-text-icon">😁</span> ${T.badgeAssignationTimeMessage}`
    : `<span class="badge-text-icon">😞</span> ${T.badgeNotAssignedMessage}`;
});

const firstAssignationDate = computed((): string => {
  return props.badge.first_assignation
    ? time.formatDate(props.badge.first_assignation)
    : '';
});

const assignationDate = computed((): string => {
  return props.badge.assignation_time
    ? time.formatDate(props.badge.assignation_time)
    : '';
});

const ownersNumber = computed((): string => {
  return `${props.badge.owners_count}/${props.badge.total_users}`;
});
</script>

<style lang="scss" scoped>
.badge {
  &-icon-wrapper {
    width: 250px;
    height: 250px;
    margin: 0 auto;
  }

  &-icon-img {
    width: 100%;
    height: 100%;
  }

  &-icon-gray {
    filter: grayscale(100%);
  }

  &-description {
    font-size: 1.2em;
  }

  &-data {
    font-size: 2.5em;
  }

  &-text {
    font-size: 1.1em;

    :deep(&-icon) {
      font-size: 30px;
    }
  }
}
</style>
