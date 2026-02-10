<template>
  <omegaup-problem-creator
    ref="creator"
    @download-zip-file="(zipObject) => $emit('download-zip-file', zipObject)"
    @upload-zip-file="(data) => $emit('upload-zip-file', data)"
    @show-update-success-message="() => $emit('show-update-success-message')"
    @download-input-file="(fileObject) => $emit('download-input-file', fileObject)"
  />
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import problem_Creator from './creator/Creator.vue';
import creatorStore from '../../problem/creator/store';

@Component({
  components: {
    'omegaup-problem-creator': problem_Creator,
  },
  store: creatorStore,
})
export default class CreatorWrapper extends Vue {}
</script>
