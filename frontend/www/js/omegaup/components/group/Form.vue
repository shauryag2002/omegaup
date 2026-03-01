<template>
  <div class="card">
    <div v-if="!isUpdate" class="card-header">
      <h3 class="card-title">
        {{ T.omegaupTitleGroupsNew }}
      </h3>
    </div>
    <div class="card-body">
      <form class="needs-validation" data-group-new @submit.prevent="onSubmit">
        <div class="row">
          <div class="form-group col-md-6">
            <label class="control-label w-100">
              {{ T.wordsName }}
              <input
                v-model="name"
                name="title"
                required
                type="text"
                class="form-control"
              />
            </label>
          </div>

          <div class="form-group col-md-6">
            <label class="control-label w-100">
              {{ T.contestNewFormShortTitleAlias }}
              <input
                v-model="alias"
                name="alias"
                required
                type="text"
                class="form-control"
                disabled="true"
              />
            </label>
            <p class="help-block">{{ T.contestNewFormShortTitleAliasDesc }}</p>
          </div>
        </div>

        <div class="row">
          <div class="form-group col-md-6">
            <label class="control-label w-100">
              {{ T.groupNewFormDescription }}
              <textarea
                v-model="description"
                required
                name="description"
                cols="30"
                rows="5"
                class="form-control"
              ></textarea>
            </label>
          </div>
        </div>

        <div class="form-group">
          <button v-if="isUpdate" type="submit" class="btn btn-primary">
            {{ T.groupNewFormUpdateGroup }}
          </button>
          <button v-else type="submit" class="btn btn-primary">
            {{ T.groupNewFormCreateGroup }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import T from '../../lang';
import latinize from 'latinize';

const props = withDefaults(
  defineProps<{
    groupAlias?: string;
    groupDescription?: string;
    groupName?: string;
    isUpdate?: boolean;
  }>(),
  {
    groupAlias: '',
    groupDescription: '',
    groupName: '',
    isUpdate: false,
  },
);

const emit = defineEmits<{
  (e: 'update-group', name: string, description: string): void;
  (e: 'create-group', name: string, alias: string, description: string): void;
  (e: 'validate-unused-alias', alias: string): void;
}>();

const alias = ref(props.groupAlias);
const description = ref(props.groupDescription);
const name = ref(props.groupName);

function onSubmit(): void {
  if (props.isUpdate) {
    emit('update-group', name.value, description.value);
    return;
  }
  emit('create-group', name.value, alias.value, description.value);
}

function generateAlias(nameValue: string): string {
  let generatedAlias = latinize(nameValue);
  generatedAlias = generatedAlias.replace(/\s+/g, '-');
  generatedAlias = generatedAlias.replace(/[^a-zA-Z0-9_-]/g, '');
  generatedAlias = generatedAlias.substring(0, 32);
  return generatedAlias;
}

watch(alias, (newValue) => {
  if (props.isUpdate) {
    return;
  }
  emit('validate-unused-alias', newValue);
});

watch(name, (newValue) => {
  if (props.isUpdate) {
    return;
  }
  alias.value = generateAlias(newValue);
});
</script>
