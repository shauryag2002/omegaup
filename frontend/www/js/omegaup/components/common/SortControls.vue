<template>
  <span class="ml-1">
    <a href="#" @click="$emit('apply-filter', column, toggleSort)">
      <font-awesome-icon
        v-if="!selected"
        :icon="['fas', 'exchange-alt']"
        color="lightgray"
        rotation="90"
      />
      <font-awesome-icon v-else :icon="['fas', iconDisplayed]" color="black" />
    </a>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { omegaup } from '../../omegaup';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faSortAlphaDown,
  faSortAlphaUp,
  faSortAmountDown,
  faSortAmountUp,
  faExchangeAlt,
} from '@fortawesome/free-solid-svg-icons';
library.add(
  faSortAlphaDown,
  faSortAlphaUp,
  faSortAmountDown,
  faSortAmountUp,
  faExchangeAlt,
);

const props = withDefaults(
  defineProps<{
    column: string;
    sortOrder: omegaup.SortOrder;
    columnType?: omegaup.ColumnType;
    columnName: string;
  }>(),
  {
    columnType: omegaup.ColumnType.Number,
  },
);

defineEmits<{
  (e: 'apply-filter', column: string, toggleSort: string): void;
}>();

const iconDisplayed = computed((): string => {
  if (props.sortOrder === omegaup.SortOrder.Descending) {
    if (props.columnType === omegaup.ColumnType.Number) {
      return 'sort-amount-down';
    }
    return 'sort-alpha-down';
  }
  if (props.columnType === omegaup.ColumnType.Number) {
    return 'sort-amount-up';
  }
  return 'sort-alpha-up';
});

const selected = computed((): boolean => {
  return props.column === props.columnName;
});

const toggleSort = computed((): string => {
  return props.sortOrder === omegaup.SortOrder.Ascending
    ? omegaup.SortOrder.Descending
    : omegaup.SortOrder.Ascending;
});
</script>
