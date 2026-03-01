<template>
  <div class="card-body text-center">
    <label class="pr-4"
      ><input v-model="type" type="radio" value="delta" />
      {{ T.profileStatisticsDelta }}</label
    >
    <label class="pr-4"
      ><input v-model="type" type="radio" value="cumulative" />
      {{ T.profileStatisticsCumulative }}</label
    >
    <label class="pr-4"
      ><input v-model="type" type="radio" value="total" />
      {{ T.profileStatisticsTotal }}</label
    >
    <div
      v-if="type != 'total' && type != ''"
      class="period-group text-center mb-2"
    >
      <label class="pr-4"
        ><input v-model="period" name="period" type="radio" value="day" />
        {{ T.profileStatisticsDay }}</label
      >
      <label class="pr-4"
        ><input v-model="period" name="period" type="radio" value="week" />
        {{ T.profileStatisticsWeek }}</label
      >
      <label class="pr-4"
        ><input v-model="period" name="period" type="radio" value="month" />
        {{ T.profileStatisticsMonth }}</label
      >
      <label class="pr-4"
        ><input v-model="period" name="period" type="radio" value="year" />
        {{ T.profileStatisticsYear }}</label
      >
    </div>
    <highcharts
      v-if="type !== 'total'"
      :options="periodStatisticOptions"
      :update-args="updateArgs"
    ></highcharts>
    <highcharts
      v-else
      :options="aggregateStatisticOptions"
      :update-args="updateArgs"
    ></highcharts>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Chart } from 'highcharts-vue';
import { omegaup } from '../../omegaup';
import T from '../../lang';
import * as Highcharts from 'highcharts/highstock';
import * as ui from '../../ui';

interface GroupedPeriods {
  day: omegaup.VerdictByDate;
  week: omegaup.VerdictByDate;
  month: omegaup.VerdictByDate;
  year: omegaup.VerdictByDate;
}

interface GroupedVerdicts {
  day: omegaup.Verdict;
  week: omegaup.Verdict;
  month: omegaup.Verdict;
  year: omegaup.Verdict;
}

interface NormalizedPeriodRunCounts {
  day: omegaup.RunCounts;
  week: omegaup.RunCounts;
  month: omegaup.RunCounts;
  year: omegaup.RunCounts;
}

interface NormalizedRunCounts {
  name: string;
  y: number;
  sliced?: boolean;
  selected?: boolean;
}

const VERDICT_LABELS: Record<string, string> = {
  AC: T.verdictAC,
  PA: T.verdictPA,
  WA: T.verdictWA,
  TLE: T.verdictTLE,
  RTE: T.verdictRTE,
  CE: T.verdictCE,
  JE: T.verdictJE,
  MLE: T.verdictMLE,
  OLE: T.verdictOLE,
  VE: T.verdictVE,
};

const emptyGroupedPeriods = {
  day: { WA: 0, PA: 0, AC: 0, TLE: 0, RTE: 0 },
  week: { WA: 0, PA: 0, AC: 0, TLE: 0, RTE: 0 },
  month: { WA: 0, PA: 0, AC: 0, TLE: 0, RTE: 0 },
  year: { WA: 0, PA: 0, AC: 0, TLE: 0, RTE: 0 },
};

const emptyPeriodRunCount = {
  day: {
    categories: [],
    cumulative: [],
    delta: [],
  },
  week: {
    categories: [],
    cumulative: [],
    delta: [],
  },
  month: {
    categories: [],
    cumulative: [],
    delta: [],
  },
  year: {
    categories: [],
    cumulative: [],
    delta: [],
  },
};

const props = defineProps<{
  data: omegaup.RunInfo[];
  username: string;
}>();

const type = ref('delta');
const period = ref<'day' | 'week' | 'month' | 'year'>('day');
const updateArgs = [true, true, { duration: 500 }];

const totalRuns = computed<number>(() => {
  let total = 0;
  for (const runs of props.data) {
    total += runs.runs;
  }
  return total;
});

const normalizedRunCounts = computed<NormalizedRunCounts[]>(() => {
  const stats = props.data;
  const runs = stats.reduce(
    (total: omegaup.Run, amount: omegaup.RunInfo) => {
      total[amount.verdict] += amount.runs;
      return total;
    },
    {
      WA: 0,
      PA: 0,
      AC: 0,
      TLE: 0,
      MLE: 0,
      OLE: 0,
      RTE: 0,
      CE: 0,
      JE: 0,
      VE: 0,
    },
  );
  const verdicts = Object.keys(runs);
  const response: NormalizedRunCounts[] = [];
  for (const verdict of verdicts) {
    const numRuns = runs[verdict];
    if (verdict == 'AC') {
      response.push({
        name: verdict,
        y: numRuns,
        sliced: true,
        selected: true,
      });
    } else {
      response.push({ name: verdict, y: numRuns });
    }
  }
  return response;
});

const groupedPeriods = computed<GroupedPeriods>(() => {
  const stats = props.data;
  const periods: Array<'day' | 'week' | 'month' | 'year'> = [
    'day',
    'week',
    'month',
    'year',
  ];
  for (const [index, run] of stats.entries()) {
    const date = new Date(run.date);
    const day = date.getDay();
    // group by days
    stats[index].day = date.toLocaleDateString(T.locale);
    // group by weeks
    const diffMonday = date.getDate() - day + (day == 0 ? -6 : 1);
    const diffSunday = date.getDate() + (7 - day);
    const firstDay = new Date(date.setDate(diffMonday));
    const lastDay = new Date(date.setDate(diffSunday));
    stats[index].week =
      firstDay.toLocaleDateString(T.locale) +
      ' - ' +
      lastDay.toLocaleDateString(T.locale);
    // group by month
    stats[index].month = run.date.substring(0, 7);
    // group by year
    stats[index].year = run.date.substring(0, 4);
  }
  const periodStats: GroupedPeriods = {
    day: {},
    week: {},
    month: {},
    year: {},
  };
  for (const p of periods) {
    periodStats[p] = stats.reduce(
      (groups: omegaup.VerdictByDate, item: omegaup.RunInfo) => {
        const val = item[p] || '';
        groups[val] = groups[val] || { WA: 0, PA: 0, AC: 0, TLE: 0, RTE: 0 };
        groups[val][item.verdict] += item.runs;
        return groups;
      },
      {},
    );
  }
  return periodStats;
});

const normalizedPeriodRunCounts = computed<NormalizedPeriodRunCounts>(() => {
  const runs: GroupedPeriods = groupedPeriods.value;
  const periods: Array<'day' | 'week' | 'month' | 'year'> = [
    'day',
    'week',
    'month',
    'year',
  ];
  const response: NormalizedPeriodRunCounts = emptyPeriodRunCount;
  const runsByVerdict: GroupedVerdicts = emptyGroupedPeriods;
  for (const p of periods) {
    response[p] = {
      categories: Object.keys(runs[p]),
      delta: [],
      cumulative: [],
    };
    const verdicts = ['AC', 'PA', 'WA', 'TLE', 'RTE'];
    for (const verdict of verdicts) {
      runsByVerdict[p][verdict] = 0;
    }
    for (const [index, verdict] of verdicts.entries()) {
      response[p].delta[index] = { name: verdict, data: [] };
      response[p].cumulative[index] = {
        name: verdict,
        data: [],
      };
      for (const [ind, date] of response[p].categories.entries()) {
        runsByVerdict[p][verdict] += runs[p][date][verdict];
        response[p].delta[index].data[ind] = runs[p][date][verdict];
        response[p].cumulative[index].data[ind] = runsByVerdict[p][verdict];
      }
    }
  }
  return response;
});

const normalizedRunCountsForPeriod = computed<omegaup.RunCounts>(() => {
  return normalizedPeriodRunCounts.value[period.value];
});

const runs = computed<omegaup.RunCounts>(() => {
  return normalizedRunCountsForPeriod.value;
});

const runsForPeriod = computed<omegaup.RunData[]>(() => {
  return type.value === 'delta' ? runs.value.delta : runs.value.cumulative;
});

const periodStatisticOptions = computed<Highcharts.Options>(() => {
  return {
    title: {
      text: ui.formatString(T.profileStatisticsVerdictsOf, {
        user: props.username,
      }),
    },
    chart: { type: 'column' },
    xAxis: {
      categories: runs.value.categories,
      title: { text: T.profileStatisticsPeriod },
      labels: {
        rotation: -45,
      },
    },
    yAxis: {
      min: 0,
      title: { text: T.profileStatisticsNumberOfSolvedProblems },
      stackLabels: {
        enabled: false,
        style: {
          fontWeight: 'bold',
          color: 'gray',
        },
      },
    },
    legend: {
      align: 'right',
      x: -30,
      verticalAlign: 'top',
      y: 25,
      floating: true,
      backgroundColor: 'white',
      borderColor: '#CCC',
      borderWidth: 1,
      shadow: false,
    },
    tooltip: {
      headerFormat: '<b>{point.x}</b><br/>',
      formatter(this: any): string {
        const verdictFull =
          VERDICT_LABELS[this.series.name] || this.series.name;
        return (
          '<b>' +
          this.x +
          '</b><br/>' +
          verdictFull +
          ': ' +
          this.y +
          '<br/>Total: ' +
          this.point.stackTotal
        );
      },
    },
    plotOptions: {
      column: {
        stacking: 'normal',
        dataLabels: {
          enabled: false,
          color: 'white',
        },
      },
    },
    series: runsForPeriod.value.map(
      (x) =>
        ({
          data: x.data,
          name: x.name,
          type: 'column',
        } as Highcharts.SeriesColumnOptions),
    ),
  };
});

const aggregateStatisticOptions = computed<Highcharts.Options>(() => {
  return {
    title: {
      text: ui.formatString(T.profileStatisticsVerdictsOf, {
        user: props.username,
      }),
    },
    chart: {
      plotShadow: false,
      type: 'pie',
    },
    xAxis: {
      title: { text: '' },
    },
    yAxis: {
      title: { text: '' },
    },
    tooltip: {
      formatter(this: any): string {
        const verdictFull = VERDICT_LABELS[this.point.name] || this.point.name;
        return T.profileStatisticsRuns + ': ' + this.y + '<br/>' + verdictFull;
      },
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          color: '#000000',
          connectorColor: '#000000',
          format: '<b>{point.name}</b>: {point.percentage:.1f} % ({point.y})',
        },
      },
    },
    series: [
      {
        name: T.profileStatisticsRuns,
        data: normalizedRunCounts.value,
        type: 'pie',
      },
    ],
  };
});
</script>
