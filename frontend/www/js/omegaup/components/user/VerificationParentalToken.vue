<template>
  <div class="card">
    <h1 class="card-header">{{ T.omegaupTitleParentalVerificationToken }}</h1>
    <div class="card-body">
      <FontAwesomeIcon
        v-if="hasParentalVerificationToken"
        :icon="['fas', 'circle-check']"
        size="2x"
        class="text-success"
      />
      <FontAwesomeIcon
        v-else
        :icon="['fas', 'circle-xmark']"
        size="2x"
        class="text-danger"
      />
      <omegaup-markdown :markdown="message"></omegaup-markdown>

      <a href="/dependents/">{{
        T.verificationParentalTokenGoToMyDependents
      }}</a>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import T from '../../lang';

import omegaup_Markdown from '../Markdown.vue';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCircleCheck, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
library.add(faCircleCheck, faCircleXmark);

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css';

@Component({
  components: {
    FontAwesomeIcon,
    'omegaup-markdown': omegaup_Markdown,
  },
})
export default class UserVerificationParentalToken extends Vue {
  @Prop() message!: string;
  @Prop() hasParentalVerificationToken!: boolean;

  T = T;
}
</script>
