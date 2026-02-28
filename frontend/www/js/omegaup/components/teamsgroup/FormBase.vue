<template>
  <div class="card">
    <slot name="teams-group-title"></slot>
    <div class="card-body">
      <form
        class="needs-validation"
        data-teams-group
        @submit.prevent="
          emit('submit', {
            name: currentName,
            description: currentDescription,
            numberOfContestants: currentNumberOfContestants,
          })
        "
      >
        <div class="row">
          <div class="form-group col-md-6">
            <label class="control-label w-100">
              {{ T.wordsName }}
              <input
                v-model="currentName"
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
              {{ T.teamsGroupNewFormDescription }}
              <textarea
                v-model="currentDescription"
                required
                name="description"
                cols="30"
                rows="5"
                class="form-control"
              ></textarea>
            </label>
          </div>

          <div class="form-group col-md-6">
            <label class="control-label w-100">
              {{ T.contestNewFormNumberOfContestants }}
              <input
                v-model="currentNumberOfContestants"
                name="number-of-contestants"
                required
                :max="maxNumberOfContestants"
                :min="minNumberOfContestants"
                type="number"
                class="form-control"
              />
            </label>
            <p class="help-block">
              {{ T.contestNewFormNumberOfContestantsDesc }}
            </p>
          </div>
        </div>

        <div class="form-group">
          <button type="submit" class="btn btn-primary" data-create-teams-group>
            <slot name="teams-group-submit-button">
              {{ T.teamsGroupFormCreate }}
            </slot>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import T from '../../lang';

const props = withDefaults(
  defineProps<{
    alias: string | null;
    description: string | null;
    name: string | null;
    numberOfContestants?: number;
    maxNumberOfContestants?: number;
    minNumberOfContestants?: number;
  }>(),
  {
    numberOfContestants: 3,
    maxNumberOfContestants: 10,
    minNumberOfContestants: 1,
  },
);

const emit = defineEmits<{
  (
    e: 'submit',
    payload: {
      name: string | null;
      description: string | null;
      numberOfContestants: number;
    },
  ): void;
  (e: 'update:alias', value: string | null): void;
  (e: 'update:description', value: string | null): void;
  (e: 'update:name', value: string | null): void;
  (e: 'update:numberOfContestants', value: number): void;
}>();

const currentAlias = ref<string | null>(props.alias);
const currentDescription = ref<string | null>(props.description);
const currentName = ref<string | null>(props.name);
const currentNumberOfContestants = ref(props.numberOfContestants);

watch(currentAlias, (newValue) => {
  emit('update:alias', newValue);
});

watch(currentDescription, (newValue) => {
  emit('update:description', newValue);
});

watch(currentName, (newValue) => {
  emit('update:name', newValue);
});

watch(currentNumberOfContestants, (newValue) => {
  emit('update:numberOfContestants', newValue);
});
</script>
