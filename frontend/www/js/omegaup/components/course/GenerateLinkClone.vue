<template>
  <div class="omegaup-course-clone card">
    <div class="card-body">
      <form class="form" @submit.prevent="$emit('generate-link', alias)">
        <h4>{{ T.courseCloneGenerateLinkTitle }}</h4>
        <p>{{ T.courseCloneGenerateLinkDescription }}</p>
        <div class="row">
          <div class="input-group mx-3">
            <button class="btn btn-primary" type="submit">
              {{ T.courseCloneGenerateLinkButton }}
            </button>
            <input
              class="form-control input-group-append"
              :value="cloneCourseURL"
              readonly
              @focus="$event.target.select()"
            />
            <div class="input-group-append">
              <button
                class="btn btn-outline-secondary"
                type="button"
                :disabled="!cloneCourseURL"
                :title="T.wordsCopyToClipboard"
                data-copy-to-clipboard
                @click="copyAndNotify(cloneCourseURL)"
              >
                <font-awesome-icon icon="clipboard" />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';
import T from '../../lang';
import * as ui from '../../ui';

import {
  FontAwesomeIcon,
  FontAwesomeLayers,
  FontAwesomeLayersText,
} from '@fortawesome/vue-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
library.add(fas);

export default defineComponent({
  name: 'CourseGenerateLinkClone',
  components: {
    'font-awesome-icon': FontAwesomeIcon,
    'font-awesome-layers': FontAwesomeLayers,
    'font-awesome-layers-text': FontAwesomeLayersText,
  },
  props: {
    alias: { type: String },
    token: { type: String },
  },
  emits: ['generate-link'],
  setup(props) {
    const copiedToClipboard = ref(false);

    const cloneCourseURL = computed((): string => {
      if (!props.token) {
        return '';
      }
      return `${window.location.origin}/course/${props.alias}/clone/${props.token}/`;
    });

    function copyAndNotify(text: string): void {
      navigator.clipboard.writeText(text);
      copiedToClipboard.value = true;
    }

    watch(
      () => copiedToClipboard.value,
      (newValue) => {
        if (!newValue) return;
        ui.success(T.passwordResetLinkCopiedToClipboard);
      },
    );

    return {
      T,
      copiedToClipboard,
      cloneCourseURL,
      copyAndNotify,
    };
  },
});
</script>
