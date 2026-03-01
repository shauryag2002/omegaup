<template>
  <span :class="classname" :title="username">
    <CountryFlag v-if="country != null" :country="country" />

    <template v-if="linkify">
      <a
        v-if="emitClickEvent"
        :href="href"
        :class="classname"
        :title="username"
        @click="$emit('click', username)"
        >{{ nameWithUsername }}</a
      >
      <a
        v-else
        :class="classname"
        :title="username"
        :href="`/profile/${username}/`"
        >{{ nameWithUsername }}</a
      >
    </template>
    <template v-else>
      <slot name="username-url">
        {{ nameWithUsername }}
      </slot>
    </template>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import CountryFlag from '../CountryFlag.vue';

const props = withDefaults(
  defineProps<{
    username: string;
    name?: string | null;
    classname: string;
    linkify: boolean;
    href?: string;
    country: string;
    emitClickEvent?: boolean;
  }>(),
  {
    name: null,
    href: '#',
    emitClickEvent: false,
  },
);

defineEmits<{
  (e: 'click', username: string): void;
}>();

const nameWithUsername = computed((): string => {
  if (props.name) {
    return `${props.name} (${props.username})`;
  }
  return props.username;
});
</script>

<style lang="scss" scope>
@import '../../../../sass/main.scss';

span {
  display: inline-block;
  max-width: 100%;
  overflow-wrap: anywhere;
  word-break: break-word;
}

span a {
  display: inline-block;
  max-width: 100%;
  white-space: normal;
}

.user-rank-unranked,
.user-rank-beginner,
.user-rank-specialist,
.user-rank-expert,
.user-rank-master,
.user-rank-international-master {
  font-weight: bold;
}

.user-rank-beginner {
  color: var(--user-rank-beginner-font-color);
}

.user-rank-specialist {
  color: var(--user-rank-specialist-font-color);
}

.user-rank-expert {
  color: var(--user-rank-expert-font-color);
}

.user-rank-master {
  color: var(--user-rank-master-font-color);
}

.user-rank-international-master {
  color: var(--user-rank-international-master-font-color);
}
</style>
