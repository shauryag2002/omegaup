<template>
  <div class="omegaup-scoreboard px-2">
    <slot name="scoreboard-header">
      <div class="text-center mt-4 pt-2">
        <h2 class="mb-4">
          <span>{{ title }}</span>
          <slot name="socket-status">
            <sup :class="socketClass" :title="socketStatusTitle">{{
              socketStatus
            }}</sup>
          </slot>
        </h2>
        <div v-if="!finishTime" class="clock">{{ INF }}</div>
        <OmegaupCountdown v-else class="clock" :target-time="finishTime" />
      </div>
    </slot>
    <Highcharts
      v-if="rankingChartOptions && Object.keys(rankingChartOptions).length"
      :options="rankingChartOptions"
    />
    <div v-else class="bg-white text-center p-4 mb-3">
      {{ T.rankingNoUsers }}
    </div>
    <label v-if="showInvitedUsersFilter">
      <input
        v-model="onlyShowExplicitlyInvited"
        class="toggle-contestants"
        type="checkbox"
      />
      {{ T.scoreboardShowOnlyInvitedIdentities }}</label
    >
    <label class="float-right"
      >{{ T.scoreboardShowParticipantsNames }}:
      <select
        v-model="nameDisplayOptions"
        class="form-control"
        data-scoreboard-options
      >
        <option :value="ui.NameDisplayOptions.Name">{{ T.wordsName }}</option>
        <option :value="ui.NameDisplayOptions.Username">
          {{ T.scoreboardAccountName }}
        </option>
        <option :value="ui.NameDisplayOptions.NameAndUsername">
          {{ T.scoreboardNameAndAccountName }}
        </option>
      </select>
    </label>
    <div class="table-responsive">
      <table data-table-scoreboard class="table">
        <thead>
          <tr>
            <th><!-- legend --></th>
            <th><!-- position --></th>
            <th>{{ T.contestParticipant }}</th>
            <th>{{ T.wordsTotal }}</th>
            <th v-for="(problem, index) in problems" :key="problem.alias">
              <a :href="'#problems/' + problem.alias" :title="problem.alias">{{
                ui.columnName(index)
              }}</a>
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(user, userIndex) in ranking">
            <tr
              v-if="showUser(user.is_invited)"
              :key="`${user.username}-${user.virtual}`"
              :class="user.username"
            >
              <td class="legend" :class="legendClass(userIndex)"></td>
              <td class="position" data-table-scoreboard-position>
                {{ user.place || '—' }}
              </td>
              <td class="user" data-table-scoreboard-username>
                {{ ui.rankingUsername(user, nameDisplayOptions) }}
                <img
                  v-if="user.country"
                  alt=""
                  height="11"
                  :src="`/media/flags/${user.country.toLowerCase()}.png`"
                  :title="user.country"
                  width="16"
                />
              </td>
              <td>
                <div class="points">
                  {{ user.total.points.toFixed(digitsAfterDecimalPoint) }}
                </div>
                <div class="penalty">
                  {{ user.total.penalty }} ({{ totalRuns(user) }})
                </div>
              </td>

              <td
                v-for="(problem, problemIndex) in user.problems"
                :key="problem.alias"
                :class="problemClass(problem, problems[problemIndex].alias)"
              >
                <template v-if="problem.runs > 0">
                  <div class="points">
                    {{ renderPoints(problem) }}
                  </div>
                  <div class="penalty">
                    <span v-if="showPenalty">{{ problem.penalty }}</span> ({{
                      problem.runs
                    }})
                  </div>
                </template>
                <template v-else> - </template>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
    <div class="footer">
      {{ lastUpdatedString }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import * as HighchartsLib from 'highcharts/highstock';
import { Chart as Highcharts } from 'highcharts-vue';
import { types } from '../../api_types';
import { omegaup } from '../../omegaup';
import T from '../../lang';
import * as ui from '../../ui';
import * as time from '../../time';
import OmegaupCountdown from '../Countdown.vue';
import { SocketStatus } from '../../arena/events_socket';

const INF = '∞';

const props = withDefaults(
  defineProps<{
    numberOfPositions?: number;
    problems: omegaup.Problem[];
    ranking: types.ScoreboardRankingEntry[];
    rankingChartOptions?: HighchartsLib.Options | null;
    lastUpdated: Date;
    showInvitedUsersFilter?: boolean;
    showPenalty?: boolean;
    showAllContestants?: boolean;
    digitsAfterDecimalPoint?: number;
    title: string;
    finishTime?: Date | null;
    socketStatus?: SocketStatus;
  }>(),
  {
    numberOfPositions: 10,
    rankingChartOptions: null,
    showInvitedUsersFilter: true,
    showPenalty: true,
    showAllContestants: false,
    digitsAfterDecimalPoint: 2,
    finishTime: null,
    socketStatus: SocketStatus.Waiting,
  },
);

const onlyShowExplicitlyInvited = ref(
  !props.showAllContestants && props.showInvitedUsersFilter,
);
const nameDisplayOptions = ref<ui.NameDisplayOptions>(
  ui.NameDisplayOptions.NameAndUsername,
);

const lastUpdatedString = computed((): null | string => {
  if (!props.lastUpdated) return null;
  return ui.formatString(T.scoreboardLastUpdated, {
    datetime: time.formatDateTime(props.lastUpdated),
  });
});

const socketClass = computed((): string => {
  if (props.socketStatus === SocketStatus.Connected) {
    return 'socket-status socket-status-ok';
  }
  if (props.socketStatus === SocketStatus.Failed) {
    return 'socket-status socket-status-error';
  }
  return 'socket-status';
});

const socketStatusTitle = computed((): string => {
  if (props.socketStatus === SocketStatus.Connected) {
    return T.socketStatusConnected;
  }
  if (props.socketStatus === SocketStatus.Failed) {
    return T.socketStatusFailed;
  }
  return T.socketStatusWaiting;
});

function legendClass(idx: number): string {
  return idx < props.numberOfPositions ? `legend-${idx + 1}` : '';
}

function renderPoints(p: types.ScoreboardRankingProblem): string {
  return (
    (p.points > 0 ? '+' : '') + p.points.toFixed(props.digitsAfterDecimalPoint)
  );
}

function totalRuns(u: types.ScoreboardRankingEntry): number {
  return u.problems.reduce(
    (acc: number, val: types.ScoreboardRankingProblem) => acc + val.runs,
    0,
  );
}

function problemClass(
  p: types.ScoreboardRankingProblem,
  alias: string,
): string {
  if (p.percent === 100) {
    return `${alias} accepted`;
  } else if (p.pending) {
    return `${alias} pending`;
  } else if (p.percent === 0 && p.runs > 0) {
    return `${alias} wrong`;
  } else {
    return alias;
  }
}

function showUser(userIsInvited: boolean): boolean {
  // Invited users filter is only available in contests, in a course all users
  // are visible in scoreboard.
  if (!props.showInvitedUsersFilter) return true;
  return userIsInvited || !onlyShowExplicitlyInvited.value;
}
</script>

<style lang="scss" scoped>
@import '../../../../sass/main.scss';
.omegaup-scoreboard {
  margin: 0 auto;

  a {
    color: var(--arena-scoreboard-a-font-color);
  }

  .footer {
    padding: 1em;
    text-align: right;
    font-size: 70%;
    color: var(--arena-scoreboard-footer-font-color);
  }

  table {
    border-collapse: collapse;
    width: 100%;
  }

  th {
    padding: 0.2em;
    text-align: center;
    border: none;
  }

  td {
    text-align: center;
    vertical-align: middle;
    border: 1px solid var(--arena-scoreboard-td-border-color);
    padding: 0.2em;

    .points {
      font-weight: bold;
    }

    .penalty {
      font-size: 70%;
    }
  }

  .user {
    text-wrap: balance;
    overflow-wrap: break-word;
    max-width: 200px;
  }

  .accepted {
    background: var(--arena-scoreboard-accepted-background-color);
  }

  .pending {
    background: var(--arena-scoreboard-pending-background-color);
  }

  .wrong {
    background: var(--arena-scoreboard-wrong-background-color);
  }

  .position.recent-event {
    font-weight: bold;
    background: var(--arena-scoreboard-position-recent-event-background-color);
  }

  .accepted.recent-event {
    background: var(--arena-scoreboard-accepted-recent-event-background-color);
  }

  .legend-1 {
    background-color: var(--arena-scoreboard-legend-1-background-color);
  }

  .legend-2 {
    background-color: var(--arena-scoreboard-legend-2-background-color);
  }

  .legend-3 {
    background-color: var(--arena-scoreboard-legend-3-background-color);
  }

  .legend-4 {
    background-color: var(--arena-scoreboard-legend-4-background-color);
  }

  .legend-5 {
    background-color: var(--arena-scoreboard-legend-5-background-color);
  }

  .legend-6 {
    background-color: var(--arena-scoreboard-legend-6-background-color);
  }

  .legend-7 {
    background-color: var(--arena-scoreboard-legend-7-background-color);
  }

  .legend-8 {
    background-color: var(--arena-scoreboard-legend-8-background-color);
  }

  .legend-9 {
    background-color: var(--arena-scoreboard-legend-9-background-color);
  }

  .legend-10 {
    background-color: var(--arena-scoreboard-legend-10-background-color);
  }

  .legend {
    width: 0.5em;
    opacity: 0.8;
  }

  .socket-status-error {
    color: var(--arena-socket-status-error-color);
  }

  .socket-status-ok {
    color: var(--arena-socket-status-ok-color);
  }

  .socket-status {
    cursor: help;
  }

  .clock {
    font-size: 3em;
    line-height: 0.4em;
  }
}
</style>
