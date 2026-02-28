<template>
  <div class="libinteractive-download panel panel-default">
    <div class="panel-heading">{{ T.outputOnlyFiles }}</div>
    <div class="panel-body">
      <a :href="zipUrl" class="btn btn-primary">{{ T.downloadZip }}</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import T from '../../../lang';

const zipUrl = computed((): string => {
  return '/problem/libinteractive/files.zip';
});
</script>
