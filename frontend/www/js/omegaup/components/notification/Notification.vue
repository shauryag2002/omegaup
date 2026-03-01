<template>
  <div class="d-flex align-items-center flex-wrap px-4">
    <hr class="w-100 my-2" />
    <div class="w-100 d-flex justify-content-between">
      <div class="notification-date">
        {{ date }}
      </div>
      <button
        class="close"
        @click.prevent="$emit('remove', notification, null)"
      >
        ❌
      </button>
    </div>
    <div
      class="w-100 d-flex align-items-center pt-1"
      :class="{ 'notification-link': url }"
      @click="handleClick"
    >
      <img
        class="d-block"
        width="50"
        :src="iconUrl"
        alt=""
        aria-hidden="true"
      />
      <template v-if="notificationMarkdown">
        <OmegaupMarkdown :markdown="notificationMarkdown"></OmegaupMarkdown>
      </template>
      <div v-else-if="url">
        <a :href="url">
          {{ text }}
        </a>
      </div>
      <div v-else>
        {{ text }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { types } from '../../api_types';
import T from '../../lang';
import * as ui from '../../ui';
import * as time from '../../time';

import OmegaupMarkdown from '../Markdown.vue';

const props = defineProps<{
  notification: types.Notification;
}>();

const emit = defineEmits<{
  (e: 'remove', notification: types.Notification, url: string | null): void;
}>();

const iconUrl = computed((): string => {
  if (props.notification.contents.body) {
    return props.notification.contents.body.iconUrl;
  }

  switch (props.notification.contents.type) {
    case 'badge':
      return `/media/dist/badges/${props.notification.contents.badge}.svg`;
    case 'demotion':
      if (props.notification.contents.status == 'banned') {
        return '/media/banned.svg';
      }
      return '/media/warning.svg';
    case 'general_notification':
      return '/media/email.svg';
    default:
      return '/media/info.png';
  }
});

const text = computed((): string => {
  switch (props.notification.contents.type) {
    case 'demotion':
      return props.notification.contents.message || '';
    case 'general_notification':
      return props.notification.contents.message || '';
    default:
      return '';
  }
});

const notificationMarkdown = computed((): string => {
  if (props.notification.contents.body) {
    return ui.formatString(
      T[props.notification.contents.body.localizationString],
      props.notification.contents.body.localizationParams,
    );
  }
  switch (props.notification.contents.type) {
    case 'badge':
      return ui.formatString(T.notificationNewBadge, {
        badgeName: T[`badge_${props.notification.contents.badge}_name`],
      });
    default:
      return '';
  }
});

const url = computed((): string => {
  if (props.notification.contents.body) {
    return props.notification.contents.body.url;
  }

  switch (props.notification.contents.type) {
    case 'general_notification':
      return props.notification.contents.url || '';
    case 'badge':
      return `/badge/${props.notification.contents.badge}/`;
    case 'demotion':
      // TODO: Add link to problem page.
      return '';
    default:
      return '';
  }
});

const date = computed(() => {
  return time.formatDateLocalHHMM(props.notification.timestamp);
});

function handleClick(): void {
  if (url.value) {
    emit('remove', props.notification, url.value);
  }
}
</script>

<style lang="scss" scoped>
@import '../../../../sass/main.scss';
.close {
  font-size: inherit;
}

.notification-date {
  font-size: 0.8rem;
  color: var(--notifications-notification-date-font-color);
}

.notification-link {
  cursor: pointer;

  &:hover {
    background-color: rgba(
      var(--notifications-notification-link-background-color--hover),
      0.05
    );
  }
}
</style>
