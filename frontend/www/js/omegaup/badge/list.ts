import { OmegaUp } from '../omegaup';
import { types } from '../api_types';
import { createApp, h } from 'vue';

import badge_List from '../components/badge/List.vue';

OmegaUp.on('ready', function () {
  const payload = types.payloadParsers.BadgeListPayload();
  createApp({
    render: () =>
      h(badge_List, {
        allBadges: new Set(payload.badges) as Set<string>,
        visitorBadges: new Set(
          payload.ownedBadges.map((badge) => badge.badge_alias),
        ) as Set<string>,
        showAllBadgesLink: false,
      }),
  }).mount('#main-container');
});
