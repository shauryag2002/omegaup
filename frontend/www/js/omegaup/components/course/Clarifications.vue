<template>
  <OmegaupClarificationList
    :clarifications="clarifications"
    :is-admin="isAdmin"
    :allow-filter-by-assignment="true"
    :page-size="pageSize"
    :page="page"
    :pager-items="pagerItems"
    @clarification-response="
      (request) => emit('clarification-response', request)
    "
  >
  </OmegaupClarificationList>
</template>

<script setup lang="ts">
import T from '../../lang';
import { types } from '../../api_types';

import OmegaupClarificationList from '../arena/ClarificationList.vue';

defineProps<{
  isAdmin: boolean;
  clarifications: types.Clarification[];
  pagerItems: types.PageItem[];
  pageSize: number;
  page: number;
}>();

const emit = defineEmits<{
  (e: 'clarification-response', request: unknown): void;
}>();
</script>
