<template>
  <div>
    <form class="form" @submit.prevent="handleCreateApiToken">
      <div class="form-group">
        <p>
          {{ T.apiTokenDescription }}
        </p>
      </div>
      <div class="form-group">
        <label class="w-100">
          {{ T.apiTokenName }}
          <input
            v-model="tokenName"
            autocomplete="off"
            class="form-control username-input"
            size="20"
            type="text"
          />
        </label>
      </div>
      <div class="form-group text-right">
        <button class="btn btn-primary" type="submit">
          {{ T.apiTokenAdd }}
        </button>
      </div>
    </form>
    <div v-if="apiTokens.length == 0">
      <div class="empty-category">
        {{ T.profileApiTokensEmpty }}
      </div>
    </div>
    <div v-else class="table-responsive">
      <table class="table table-striped table-over">
        <thead>
          <tr>
            <th>{{ T.apiTokenName }}</th>
            <th>{{ T.apiTokenTimestamp }}</th>
            <th>{{ T.apiTokenLastTimeUsed }}</th>
            <th>{{ T.apiTokenResetTime }}</th>
            <th>{{ T.apiTokenRemaining }}</th>
            <th>{{ T.apiTokenLimit }}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="apiToken in apiTokens" :key="apiToken.name">
            <td data-label="Token">{{ apiToken.name }}</td>
            <td data-label="Timestamp">{{ formatTime(apiToken.timestamp) }}</td>
            <td data-label="Last used">{{ formatTime(apiToken.last_used) }}</td>
            <td data-label="Reset time">
              {{ formatTime(apiToken.rate_limit.reset) }}
            </td>
            <td data-label="Remaining">{{ apiToken.rate_limit.remaining }}</td>
            <td data-label="Limit">{{ apiToken.rate_limit.limit }}</td>
            <td>
              <button
                class="btn btn-secondary btn-sm"
                @click="emit('revoke-api-token', apiToken.name)"
              >
                {{ T.apiTokenRevoke }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { types } from '../../api_types';
import T from '../../lang';
import * as time from '../../time';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
library.add(fas);

withDefaults(
  defineProps<{
    apiTokens?: types.ApiToken[];
  }>(),
  {
    apiTokens: () => [],
  },
);

const emit = defineEmits<{
  (e: 'create-api-token', name: string | null): void;
  (e: 'revoke-api-token', name: string): void;
}>();

const tokenName = ref<string | null>(null);

function handleCreateApiToken(): void {
  emit('create-api-token', tokenName.value);
  tokenName.value = null; // Clear the tokenName value
}

function formatTime(value: Date): string {
  return time.formatDateTime(value);
}
</script>

<style lang="scss" scoped>
.table-responsive {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.table {
  white-space: nowrap;

  th,
  td {
    vertical-align: middle;
  }
}
</style>
