<template>
  <div class="multi-user-add-area">
    <textarea
      v-if="isFocused || !usersList.length"
      v-model="bulkContestants"
      class="form-control contestants"
      data-contestant-names
      @input.prevent="onBulkContestantsChanged"
      @blur.prevent="isFocused = false"
    >
    </textarea>
    <div v-else class="form-control contestants">
      <span href="#" class="edit-icon" @click.prevent="isFocused = true">{{
        T.wordsEdit
      }}</span>
      <div class="users-list">
        <div v-for="user in usersList" :key="user" class="users-list__item">
          <span
            class="tags-input-badge tags-input-badge-pill tags-input-badge-selected-default"
            >{{ user }}</span
          >
          <a
            href="#"
            class="tags-input-remove"
            @click.prevent="removeUser(user)"
          ></a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import T from '../../lang';

const debounce = (fn: (event: Event) => void, waitTime: number) => {
  let timer: any = null;

  return (...args: any) => {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      fn(...args);
    }, waitTime);
  };
};

const WAIT_TIME = 1000;

const props = defineProps<{
  users: string[];
}>();

const emit = defineEmits<{
  (e: 'update-users', users: string[]): void;
}>();

const isFocused = ref(false);
const bulkContestants = ref<string | null>(null);

// if the users prop is not empty, we need to keep track of those users in the usersList
const usersList = ref<string[]>(props.users || []);

function onTextAreaChange(event: Event) {
  const target = event.target as HTMLTextAreaElement;
  const { value } = target;

  // 1. Separate original string by new lines
  const users = value.split('\n').reduce((acc, line) => {
    // 2. Separate each line by commas
    const lineUsers = line.split(',').reduce((acc, token) => {
      // 3. Separate each token by spaces
      const tokenUsers = token.split(' ').reduce((acc, token) => {
        if (token.trim() !== '') {
          acc.push(token.trim());
        }
        return acc;
      }, [] as string[]);
      return acc.concat(tokenUsers);
    }, [] as string[]);
    return acc.concat(lineUsers);
  }, [] as string[]);

  usersList.value = Array.from(new Set([...users])); // Removes duplicates
  bulkContestants.value = usersList.value.join(',');

  isFocused.value = false;
}

const onBulkContestantsChanged = debounce(onTextAreaChange, WAIT_TIME);

function removeUser(user: string) {
  usersList.value = usersList.value.filter((u) => u !== user);
  bulkContestants.value = usersList.value.join(',');
  isFocused.value = false;
}

watch(
  () => props.users,
  () => {
    // We need to keep the usersList without any user that is part of the users prop
    usersList.value = usersList.value.filter(
      (user) => !props.users.includes(user),
    );
    bulkContestants.value = usersList.value.join(',');
  },
);

// When the usersList changes, emit the new value to the parent
watch(usersList, () => {
  emit('update-users', usersList.value);
});
</script>

<style scoped>
.multi-user-add-area {
  position: relative;
}

.form-control {
  min-height: 4rem;
  overflow: auto;
}

.users-list {
  display: flex;
  flex-wrap: wrap;

  max-width: 95%;
}

.edit-icon {
  position: absolute;
  top: 0;
  right: 1.5rem;

  color: var(--multi-user-add-area-edit-button-color);
}

.edit-icon:hover {
  color: var(--multi-user-add-area-edit-button-color-hover);
  cursor: pointer;
}

.users-list__item {
  position: relative;
}

.users-list > div {
  margin: 0.25rem;
}

.tags-input-badge-pill {
  padding-right: 1.2rem;
}

.tags-input-remove {
  cursor: pointer;
  right: 0.1rem;
  top: 0.1rem;
}

.tags-input-remove:before,
.tags-input-remove:after {
  width: 10px;
}
</style>
