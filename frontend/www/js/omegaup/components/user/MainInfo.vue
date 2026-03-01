<template>
  <div class="card">
    <CountryFlag
      v-if="profile.country_id"
      class="m-1"
      :country="profile.country_id"
    />
    <div class="card-body">
      <div class="text-center rounded-circle bottom-margin">
        <img
          class="rounded-circle"
          :src="profile.gravatar_92"
          :alt="profile.username"
        />
      </div>
    </div>
    <div class="card-title text-center">
      <div class="mb-3">
        <UserUsername
          :classname="profile.classname"
          :username="profile.username"
        ></UserUsername>
      </div>
      <div class="mb-3">
        <h4 v-if="profile.rankinfo.rank > 0" class="m-0">
          {{ `#${profile.rankinfo.rank}` }}
        </h4>
        <small v-else>
          <strong> {{ rank }} </strong>
        </small>
        <p>
          <small>
            {{ T.profileRank }}
          </small>
        </p>
      </div>
      <div v-if="profile.is_own_profile || !profile.is_private" class="mb-3">
        <h4 class="m-0">
          {{ Object.keys(solvedProblems).length }}
        </h4>
        <p>
          <small>{{ T.profileSolvedProblems }}</small>
        </p>
      </div>
      <div
        v-if="
          profile.preferred_language &&
          (profile.is_own_profile || !profile.is_private)
        "
        class="mb-3"
      >
        <h5 class="m-0">
          {{
            profile.programming_languages[profile.preferred_language].split(
              ' ',
            )[0]
          }}
        </h5>
        <p>
          <small>{{ T.userEditPreferredProgrammingLanguage }}</small>
        </p>
      </div>
    </div>
    <div v-if="profile.is_own_profile" class="mb-3 text-center">
      <a class="btn btn-primary btn-sm" :href="buttonUrl">{{ buttonText }}</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import T from '../../lang';
import CountryFlag from '../CountryFlag.vue';
import UserUsername from './Username.vue';
import { types } from '../../api_types';
import { Problem } from '../../linkable_resource';

const props = defineProps<{
  data: types.ExtraProfileDetails | null;
  profile: types.UserProfileInfo;
  edit: boolean;
}>();

const buttonText = computed((): string => {
  return props.edit ? T.userEditViewProfile : T.profileEdit;
});

const buttonUrl = computed((): string => {
  return props.edit ? '/profile/' : '/profile/#edit-basic-information';
});

const solvedProblems = computed((): Problem[] => {
  if (!props.data?.solvedProblems) return [];
  return props.data.solvedProblems.map((problem) => new Problem(problem));
});

const rank = computed((): string => {
  switch (props.profile.classname) {
    case 'user-rank-beginner':
      return T.profileRankBeginner;
    case 'user-rank-specialist':
      return T.profileRankSpecialist;
    case 'user-rank-expert':
      return T.profileRankExpert;
    case 'user-rank-master':
      return T.profileRankMaster;
    case 'user-rank-international-master':
      return T.profileRankInternationalMaster;
    default:
      return T.profileRankUnrated;
  }
});
</script>
