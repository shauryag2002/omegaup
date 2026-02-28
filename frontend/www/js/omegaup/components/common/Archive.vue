<template>
  <div class="card">
    <h4 class="card-header">{{ archiveHeaderTitle }}</h4>
    <div class="card-body">
      <p class="card-text">
        {{ archiveHelpText }}
      </p>
      <button
        type="button"
        class="btn btn-primary d-block mx-auto"
        data-toggle="modal"
        data-target=".modal"
      >
        {{ archiveButtonDescription }}
      </button>
      <div class="modal fade" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-body">
              {{ archiveConfirmText }}
              <div class="d-flex justify-content-around mt-4">
                <button
                  type="button"
                  class="btn btn-secondary"
                  data-dismiss="modal"
                >
                  {{ T.wordsClose }}
                </button>
                <button
                  type="button"
                  class="btn btn-primary"
                  data-dismiss="modal"
                  @click="onArchive"
                >
                  {{ T.wordsConfirm }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import T from '../../lang';

const props = defineProps<{
  alreadyArchived: boolean;
  archiveHelpText: string;
  archiveHeaderTitle: string;
  archiveButtonDescription: string;
  archiveConfirmText: string;
}>();

const emit = defineEmits<{
  (e: 'archive', value: boolean): void;
}>();

function onArchive(): void {
  emit('archive', !props.alreadyArchived);
}
</script>
