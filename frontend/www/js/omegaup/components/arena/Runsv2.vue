<template>
  <div class="mt-4" data-runs>
    <h5 class="mb-3">{{ T.wordsSubmissions }}</h5>
    <b-table :fields="tableFields" :items="filteredRuns" striped responsive>
      <template #cell(index)="row">
        <b-button
          :disabled="!row.detailsShowing && showDetails"
          variant="link"
          size="sm"
          @click="toggleDetails(row)"
        >
          <FontAwesomeIcon
            v-if="!row.detailsShowing"
            :icon="['fas', 'chevron-right']"
          />
          <FontAwesomeIcon v-else :icon="['fas', 'chevron-down']" />
        </b-button>
      </template>

      <template #row-details>
        {{ currentRunDetails }}
      </template>

      <template #cell(guid)="data">
        <acronym :title="data.value" data-run-guid>
          <tt>{{ data.value.substring(0, 8) }}</tt>
        </acronym>
      </template>

      <template #cell(verdict)="data">
        <span class="mr-1">{{ status(data.item) }}</span>
        <b-button
          v-if="data.item.status === 'ready' && data.item.verdict !== 'AC'"
          v-b-tooltip.right="statusHelp(data.item)"
          size="sm"
          ><FontAwesomeIcon :icon="['fas', 'circle-question']" />
        </b-button>
      </template>

      <!-- TODO: Add the new submission button -->
    </b-table>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, PropType } from 'vue';
import T from '../../lang';
import { types } from '../../api_types';
import * as time from '../../time';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css';
import { BButton, BTable, vBTooltip } from 'bootstrap-vue-next';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faChevronRight,
  faChevronDown,
  faCircleQuestion,
} from '@fortawesome/free-solid-svg-icons';
library.add(faChevronRight, faChevronDown, faCircleQuestion);

export enum PopupDisplayed {
  None,
  RunSubmit,
  RunDetails,
  Promotion,
  Demotion,
  Reviewer,
}

interface TableField {
  key: string;
  label: string;
  class?: string;
  thClass?: string;
  tdClass?: string;
}

interface TableRunItem {
  guid: string;
  time: string;
  language: string;
  verdict: string;
  runtime: string;
  memory: string;
  percentage: string;
  status: string;
  type?: string;
  _cellVariants?: {
    [key: string]: string;
  };
}

export default defineComponent({
  name: 'Runs',
  components: {
    FontAwesomeIcon,
  },
  directives: {
    'b-tooltip': vBTooltip,
  },
  props: {
    currentRunDetails: {
      type: Object as PropType<types.RunDetails | null>,
      default: null,
    },
    problemAlias: {
      type: String as PropType<string | null>,
      default: null,
    },
    runs: {
      type: Array as PropType<types.Run[] | null>,
      default: null,
    },
  },
  emits: ['show-run-details'],
  setup(props, { emit }) {
    const showDetails = ref(false);

    function toggleDetails(row: {
      toggleDetails: () => void;
      item: TableRunItem;
    }): void {
      showDetails.value = !showDetails.value;
      if (showDetails.value) {
        emit('show-run-details', { guid: row.item.guid });
      }
      row.toggleDetails();
    }

    const sortedRuns = computed((): types.Run[] => {
      if (!props.runs) {
        return [];
      }
      return props.runs
        .slice()
        .sort((a, b) => b.time.getTime() - a.time.getTime());
    });

    function memory(run: types.Run): string {
      if (
        run.status == 'ready' &&
        run.verdict != 'JE' &&
        run.verdict != 'VE' &&
        run.verdict != 'CE'
      ) {
        let prefix = '';
        if (run.verdict == 'MLE') {
          prefix = '>';
        }
        return `${prefix}${(run.memory / (1024 * 1024)).toFixed(2)} MB`;
      } else {
        return '—';
      }
    }

    function percentage(run: types.Run): string {
      if (
        run.status == 'ready' &&
        run.verdict != 'JE' &&
        run.verdict != 'VE' &&
        run.verdict != 'CE'
      ) {
        return `${(run.score * 100).toFixed(2)}%`;
      }
      return '—';
    }

    function runtime(run: types.Run): string {
      if (
        run.status == 'ready' &&
        run.verdict != 'JE' &&
        run.verdict != 'VE' &&
        run.verdict != 'CE'
      ) {
        let prefix = '';
        if (run.verdict == 'TLE') {
          prefix = '>';
        }
        return `${prefix}${(run.runtime / 1000).toFixed(2)} s`;
      }
      return '—';
    }

    function statusClass(run: types.Run): string {
      if (run.status != 'ready') return '';
      if (run.type == 'disqualified') return 'danger';
      if (run.verdict == 'AC') {
        return 'success';
      }
      if (run.verdict == 'PA') {
        return 'info';
      }
      if (run.verdict == 'WA') {
        return 'danger';
      }
      if (run.verdict == 'TLE') {
        return 'warning';
      }
      if (run.verdict == 'OLE') {
        return 'warning';
      }
      if (run.verdict == 'MLE') {
        return 'warning';
      }
      if (run.verdict == 'RTE') {
        return 'warning';
      }
      if (run.verdict == 'RFE') {
        return 'warning';
      }
      if (run.verdict == 'CE') {
        return 'warning';
      }
      if (run.verdict == 'JE' || run.verdict == 'VE') {
        return 'danger';
      }
      return '';
    }

    function status(run: types.Run): string {
      if (run.type == 'disqualified') return T.arenaRunsActionsDisqualified;
      return run.status == 'ready' ? run.verdict : run.status;
    }

    function statusHelp(run: types.Run): string {
      if (run.status != 'ready' || run.verdict == 'AC') {
        return '';
      }
      if (run.language == 'kj' || run.language == 'kp') {
        if (run.verdict == 'RTE' || run.verdict == 'RE') {
          return T.verdictHelpKarelRTE;
        } else if (run.verdict == 'TLE' || run.verdict == 'TO') {
          return T.verdictHelpKarelTLE;
        }
      }
      if (run.type == 'disqualified') return T.verdictHelpDisqualified;
      const verdict = T[`verdict${run.verdict}`];
      const verdictHelp = T[`verdictHelp${run.verdict}`];
      return `${verdict}: ${verdictHelp}`;
    }

    const filteredRuns = computed((): TableRunItem[] => {
      return sortedRuns.value.map((run) => {
        return {
          time: time.formatDateLocalHHMM(run.time),
          guid: run.guid,
          language: run.language,
          memory: memory(run),
          percentage: percentage(run),
          runtime: runtime(run),
          verdict: run.verdict,
          status: run.status,
          type: run.type,
          _cellVariants: {
            verdict: statusClass(run),
          },
        };
      });
    });

    const tableFields = computed((): (string | TableField)[] => {
      return [
        {
          label: '',
          key: 'index',
          class: 'align-middle',
        },
        {
          label: T.wordsTime,
          key: 'time',
          class: 'text-center align-middle',
        },
        {
          label: T.runGUID,
          key: 'guid',
          class: 'text-center align-middle',
        },
        // TODO: Add the participant, contest and problem...
        {
          label: T.wordsStatus,
          key: 'verdict',
          class: 'text-center align-middle',
        },
        // TODO: Add the points and penalty...
        {
          label: T.wordsPercentage,
          key: 'percentage',
          class: 'align-middle',
          thClass: 'text-center',
          tdClass: 'text-right',
        },
        {
          label: T.wordsLanguage,
          key: 'language',
          class: 'text-center align-middle',
        },
        {
          label: T.wordsMemory,
          key: 'memory',
          class: 'align-middle',
          thClass: 'text-center',
          tdClass: 'text-right',
        },
        {
          label: T.wordsRuntime,
          key: 'runtime',
          class: 'align-middle',
          thClass: 'text-center',
          tdClass: 'text-right',
        },
        {
          label: T.wordsActions,
          key: 'actions',
          class: 'text-center align-middle',
        },
      ];
    });

    return {
      T,
      time,
      showDetails,
      toggleDetails,
      filteredRuns,
      tableFields,
      status,
      statusHelp,
    };
  },
});
</script>
