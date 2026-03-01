<template>
  <div class="card-body py-3 px-4">
    <hr class="my-3" />
    <form enctype="multipart/form-data" method="post" @submit="onSubmit">
      <div class="form-group col-md-12">
        <label class="control-label">{{ T.problemEditCommitMessage }}</label>
        <input v-model="commitMessage" class="form-control" />
      </div>

      <div v-if="isTruncatedInput" class="form-group col-md-6">
        <label class="control-label">{{ T.problemEditInputFile }}</label>
        <input
          type="file"
          class="form-control"
          name="input_file"
          accept=".in,.txt"
        />
      </div>

      <div v-if="isTruncatedOutput" class="form-group col-md-6">
        <label class="control-label">{{ T.problemEditOutputFile }}</label>
        <input
          type="file"
          class="form-control"
          name="output_file"
          accept=".out,.txt"
        />
      </div>

      <input type="hidden" name="request" value="cases" />
      <input type="hidden" name="problem_alias" :value="alias" />
      <input type="hidden" name="message" :value="commitMessage" />
      <input type="hidden" name="contents" :value="contentsPayload" />

      <div class="col-md-12 mt-3">
        <button
          v-show="!isEmbedded"
          ref="submitButton"
          class="btn btn-primary"
          type="submit"
          :disabled="!commitMessage.trim()"
        >
          {{ T.problemEditSaveCase }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, inject } from 'vue';
import { useStore } from 'vuex';
import T from '../../../../lang';
import { Case, Group, CaseLine } from '@/js/omegaup/problem/creator/types';
import * as ui from '@/js/omegaup/ui';

const store = useStore();

const alias = inject<string>('problemAlias')!;

const props = withDefaults(
  defineProps<{
    isTruncatedInput?: boolean;
    isTruncatedOutput?: boolean;
    isCaseEdit?: boolean;
    isEmbedded?: boolean;
    triggerSubmit?: boolean;
    editGroup?: Group | null;
  }>(),
  {
    isTruncatedInput: false,
    isTruncatedOutput: false,
    isCaseEdit: false,
    isEmbedded: false,
    triggerSubmit: false,
    editGroup: null,
  },
);

const commitMessage = ref(
  props.isCaseEdit ? T.problemEditUpdatingCase : T.problemEditUpdatingGroup,
);

const submitButton = ref<HTMLButtonElement>();

const getSelectedCase = computed(
  () => store.getters['casesStore/getSelectedCase'] as Case,
);
const getSelectedGroup = computed(
  () => store.getters['casesStore/getSelectedGroup'] as Group,
);
const getLinesFromSelectedCase = computed(
  () => store.getters['casesStore/getLinesFromSelectedCase'] as CaseLine[],
);

const inputText = computed((): string => {
  return (getLinesFromSelectedCase.value || [])
    .map((l) => l.data.value || '')
    .join('\n');
});

const contentsPayload = computed((): string => {
  if (props.isCaseEdit) {
    return JSON.stringify({
      group: getSelectedGroup.value,
      case: getSelectedCase.value,
    });
  }

  const groupToSend =
    props.editGroup !== null ? props.editGroup : getSelectedGroup.value;

  return JSON.stringify({
    group: groupToSend,
  });
});

watch(
  () => props.triggerSubmit,
  (newVal: boolean) => {
    if (newVal && props.isEmbedded) {
      nextTick(() => {
        submitButton.value?.click();
      });
    }
  },
);

function onSubmit(e: Event) {
  if (!commitMessage.value.trim()) {
    ui.error(T.editFieldRequired);
    e.preventDefault();
  }
}
</script>
