<template>
  <div class="card">
    <div v-if="!isProfile" class="card-header">
      <h4 class="card-title">
        {{ T.omegaupTitleBadges }}
        <span class="badge badge-secondary">{{ badges.length }} </span>
      </h4>
    </div>
    <div class="card-body">
      <div class="container-fluid">
        <div class="row">
          <OmegaupBadge
            v-for="(badge, idx) in badges"
            :key="idx"
            :badge="badge"
          ></OmegaupBadge>
        </div>
      </div>
    </div>
    <div v-if="showAllBadgesLink" class="card-footer">
      <a v-if="showAllBadgesLink" class="badges-link" href="/badge/list/">{{
        T.wordsBadgesSeeAll
      }}</a>
    </div>
    <div v-show="!allBadges">
      <img src="/media/wait.gif" :alt="T.wordsLoading" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { types } from '../../api_types';
import T from '../../lang';
import OmegaupBadge from '../badge/Badge.vue';

const props = defineProps<{
  allBadges: Set<string>;
  visitorBadges: Set<string>;
  showAllBadgesLink: boolean;
}>();

const isProfile = props.showAllBadgesLink;

const badges = computed((): types.Badge[] => {
  return Array.from(props.allBadges)
    .map((badge: string) => ({
      badge_alias: badge,
      unlocked: props.visitorBadges.has(badge),
      assignation_time: new Date(),
      total_users: 0,
      owners_count: 0,
    }))
    .sort((a: types.Badge, b: types.Badge) => {
      // Alphabetical order BY NAME, not alias.
      const aName = getBadgeName(a.badge_alias);
      const bName = getBadgeName(b.badge_alias);
      if (aName == bName) {
        return 0;
      }
      return aName < bName ? -1 : 1;
    });
});

function getBadgeName(alias: string): string {
  return T[`badge_${alias}_name`];
}
</script>

<style lang="scss" scoped>
@import '../../../../sass/main.scss';
a.badges-link {
  color: var(--badges-link-font-color);
  font-size: 1rem;
}
</style>
