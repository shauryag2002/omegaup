<template>
  <div class="output-only-download panel panel-default">
    <div class="panel-heading">Output Only Files</div>
    <div class="panel-body">
      <a :href="zipUrl" class="btn btn-primary"> Download </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const zipUrl = computed((): string => {
  // This should eventually be dynamic
  return '/problem/output-only/files.zip';
});
</script>
