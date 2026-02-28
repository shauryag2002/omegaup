<template>
  <b-collapse :visible="visible" class="w-100 mt-2">
    <form enctype="multipart/form-data" method="post" @submit="onSubmit">
      <div class="p-3 border rounded bg-light item-active-for-delete">
        <div class="form-group">
          <label class="control-label">{{ T.problemEditCommitMessage }}</label>
          <input v-model="commitMessage" class="form-control" />
        </div>

        <input type="hidden" name="request" value="deleteGroupCase" />
        <input type="hidden" name="problem_alias" :value="alias" />
        <input type="hidden" name="message" :value="commitMessage" />
        <input type="hidden" name="contents" :value="contentsPayload" />

        <div class="button-container mt-3">
          <button
            class="btn btn-danger"
            type="submit"
            :disabled="!commitMessage.trim()"
          >
            {{ T.problemEditConfirmDeletion }}
          </button>

          <button class="btn btn-secondary" type="button" @click="handleCancel">
            {{ T.wordsCancel }}
          </button>
        </div>
      </div>
    </form>
  </b-collapse>
</template>

<script setup lang="ts">
import { ref, computed, watch, inject } from 'vue';
import T from '../../../../lang';
import * as ui from '@/js/omegaup/ui';

const alias = inject<string>('problemAlias')!;

const props = defineProps<{
  visible: boolean;
  itemName: string;
  itemId?: string;
  onCancel: () => void;
}>();

const commitMessage = ref('');

watch(
  () => props.visible,
  (newValue: boolean) => {
    if (newValue) {
      commitMessage.value = `${T.problemEditDeletingPrefix} ${props.itemName}`;
    } else {
      commitMessage.value = '';
    }
  },
);

const contentsPayload = computed((): string => {
  return JSON.stringify({
    id: props.itemId,
  });
});

function onSubmit(e: Event) {
  if (!commitMessage.value.trim()) {
    ui.error(T.editFieldRequired);
    e.preventDefault();
  }
}

function handleCancel() {
  props.onCancel();
  commitMessage.value = '';
}
</script>

<style scoped lang="scss">
.item-active-for-delete {
  border-left: 3px solid var(--bs-danger) !important;
}

.button-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;

  .btn {
    flex: 1 1 140px;
    margin: 0 !important;
    white-space: normal;
  }
}
</style>
