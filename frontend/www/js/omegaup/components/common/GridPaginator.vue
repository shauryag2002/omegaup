<template>
  <div class="card">
    <h6 v-if="title" class="card-header">
      {{ title }}
      <span class="badge badge-secondary">{{ filteredItems.length }}</span>
      <slot name="header-link"></slot>
    </h6>
    <div v-if="sortOptions.length > 0" class="card-body text-center">
      <div class="form-check form-check-inline">
        <label
          v-for="(sortOption, index) in sortOptions"
          :key="index"
          class="form-check-label mr-4"
        >
          <input
            v-model="currentSortOption"
            class="form-check-input m-0"
            name="sort-selector"
            type="radio"
            :value="sortOption.value"
          />
          {{ sortOption.title }}
        </label>
      </div>
    </div>
    <table
      v-if="filteredItems.length > 0"
      class="table table-striped mb-0 table-responsive col-12 table-typo"
    >
      <slot name="table-header"></slot>
      <tbody>
        <tr v-for="(group, index) in paginatedItems" :key="index">
          <th v-if="showPageOffset" scope="row" class="text-center">
            {{ currentPageNumber * rowsPerPage + (index + 1) }}
          </th>
          <td v-for="(item, itemIndex) in group" :key="itemIndex">
            <slot name="item-data" :item="item">
              <a :href="item.getUrl()">
                <img
                  v-if="item.getLogo()"
                  :src="item.getLogo().url"
                  :title="item.getLogo().title"
                  :alt="item.getLogo().title"
                />
                {{ item.toString() }}
              </a>
            </slot>
          </td>
          <td v-if="!group[0].getBadge().isEmpty()" class="text-right">
            <strong>{{ group[0].getBadge().get() }}</strong>
          </td>
        </tr>
      </tbody>
    </table>
    <form
      v-if="shouldShowFilterInput"
      class="form-inline m-3"
      @submit.prevent=""
    >
      <input
        v-model="filter"
        class="form-control mr-sm-2 mb-2"
        type="search"
        :placeholder="filterByProblemText"
      />
    </form>
    <div v-if="filteredItems.length > 0" class="card-footer text-center">
      <div class="btn-group" role="group">
        <button
          class="btn btn-primary"
          type="button"
          data-button-previous
          :disabled="totalPagesCount === 1 || currentPageNumber === 0"
          @click="previousPage"
        >
          {{ T.wordsPrevious }}
        </button>
        <button
          class="btn btn-primary"
          type="button"
          data-button-next
          :disabled="
            totalPagesCount === 1 || currentPageNumber >= totalPagesCount - 1
          "
          @click="nextPage"
        >
          {{ T.wordsNext }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import T from '../../lang';
import { LinkableResource } from '../../linkable_resource';

interface SortOption {
  value: string;
  title: string;
}

const props = withDefaults(
  defineProps<{
    items: LinkableResource[];
    itemsPerPage: number;
    columns?: number;
    title: string;
    showPageOffset?: boolean;
    shouldShowFilterInput?: boolean;
    sortOptions?: SortOption[];
  }>(),
  {
    columns: 3,
    showPageOffset: false,
    shouldShowFilterInput: false,
    sortOptions: () => [],
  },
);

const emit = defineEmits<{
  (e: 'sort-option-change', value: string): void;
}>();

const currentPageNumber = ref(0);
const currentSortOption = ref(
  props.sortOptions.length > 0 ? props.sortOptions[0].value : '',
);
const filter = ref<string | null>(null);
const filteredItems = ref<LinkableResource[]>(props.items);

function nextPage(): void {
  currentPageNumber.value++;
}

function previousPage(): void {
  currentPageNumber.value--;
}

const rowsPerPage = computed((): number => {
  return Math.floor(props.itemsPerPage / props.columns);
});

const totalPagesCount = computed((): number => {
  const totalRows = Math.ceil(filteredItems.value.length / props.columns);
  return Math.ceil(totalRows / rowsPerPage.value);
});

const itemsRows = computed((): LinkableResource[][] => {
  const groups = [];
  for (let i = 0; i < filteredItems.value.length; i += props.columns) {
    groups.push(filteredItems.value.slice(i, i + props.columns));
  }
  return groups;
});

const paginatedItems = computed((): LinkableResource[][] => {
  const start = currentPageNumber.value * rowsPerPage.value;
  const end = start + rowsPerPage.value;
  return itemsRows.value.slice(start, end);
});

const filterByProblemText = computed((): string => {
  return T.userProfileProblemsFilter;
});

watch(filter, (newFilter) => {
  if (newFilter) {
    filteredItems.value = props.items.filter((item: LinkableResource) =>
      item.toString().toLowerCase().includes(newFilter.toLowerCase()),
    );
  }
});

watch(currentSortOption, (newSelector) => {
  emit('sort-option-change', newSelector);
});
</script>

<style>
@media (max-width: 550px) {
  .table-typo td,
  .table-typo th {
    display: block;
    background-color: #fff;
    border: 1px solid #ddd;
  }
}
</style>
