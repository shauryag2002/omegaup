<template>
  <div class="panel panel-default">
    <div class="panel-heading">
      <h4 class="panel-title">
        {{ T.certificateDetailsTitle }}
      </h4>
    </div>
    <div class="panel-body">
      <OmegaupMarkdown
        :markdown="
          ui.formatString(T.certificateDetailsBody, {
            uuid: encodeURIComponent(uuid),
          })
        "
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import T from '../../lang';
import * as ui from '../../ui';

import OmegaupMarkdown from '../Markdown.vue';

defineProps<{
  uuid: string;
}>();
</script>
