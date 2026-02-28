<template>
  <div class="container-fluid">
    <h2 class="text-center">
      <a :href="`/course/${course.alias}/`">{{ course.name }}</a>
    </h2>
    <br />
    <div>
      <div class="d-flex justify-content-center">
        <select v-model="selected" class="text-center">
          <option v-for="option in options" :value="option.value">
            {{ option.text }}
          </option>
        </select>
      </div>
      <highcharts :options="selected"></highcharts>
    </div>
  </div>
  <!-- panel -->
</template>

<script setup lang="ts">
import { Chart } from 'highcharts-vue';
import { ref, computed } from 'vue';
import { types } from '../../api_types';
import T from '../../lang';

const ORDERED_VERDICTS = [
  'AC',
  'PA',
  'WA',
  'RTE',
  'RFE',
  'CE',
  'PE',
  'TLE',
  'OLE',
  'MLE',
  'JE',
  'VE',
];

const props = defineProps<{
  course: types.CourseDetails;
  problemStats: types.CourseProblemStatistics[];
  verdicts: types.CourseProblemVerdict[];
}>();

// helper functions
const problems = computed<string[]>(() => {
  return props.problemStats.map(
    (problem) => `${problem.assignment_alias} - ${problem.problem_alias}`,
  );
});

const maxPoints = computed<number>(() => {
  let max = 0;
  for (const problem of props.problemStats) {
    if (problem.max_points > max) max = problem.max_points;
  }
  return max;
});

function getMaxStat(statistic: 'variance' | 'avg_runs'): number {
  let max = 0;
  for (const stat of getStatistic(statistic)) {
    if (stat > max) max = stat;
  }
  return max;
}

function problemIndices(): {
  [assignmentAlias: string]: { [problemAlias: string]: number };
} {
  const indices: {
    [assignmentAlias: string]: { [problemAlias: string]: number };
  } = {};
  props.problemStats.forEach((problem, index) => {
    if (
      !Object.prototype.hasOwnProperty.call(indices, problem.assignment_alias)
    )
      indices[problem.assignment_alias] = {};
    indices[problem.assignment_alias][problem.problem_alias] = index;
  });
  return indices;
}

const runsPerAssignment = computed<number[]>(() => {
  const probs: string[] = problems.value;
  const indices = problemIndices();
  let runSum: number[] = new Array(probs.length).fill(0);
  for (const stat of props.verdicts) {
    runSum[indices[stat.assignment_alias][stat.problem_alias]] += stat.runs;
  }
  return runSum;
});

function verdictList(): string[] {
  let verdictsList: string[] = [];
  for (const stat of props.verdicts) {
    if (stat.verdict && !verdictsList.includes(stat.verdict))
      verdictsList.push(stat.verdict);
  }
  return verdictsList;
}

const verdictStats = computed(() => {
  const verdictsList: string[] = verdictList();
  const assignmentRuns: number[] = runsPerAssignment.value;
  const problemCount: number = problems.value.length;
  let series: { name: string; data: number[] }[] = [];
  const indices = problemIndices();
  const verdictIndices: { [verdict: string]: number } = {};
  verdictsList.forEach((verdict, index) => {
    verdictIndices[verdict] = index;
  });
  // create zero-d out runs 2D array
  const runs: number[][] = verdictsList.map(() =>
    new Array(problemCount).fill(0),
  );
  // fill runs with verdict runs
  for (const stat of props.verdicts) {
    if (!stat.verdict) break;
    runs[verdictIndices[stat.verdict]][
      indices[stat.assignment_alias][stat.problem_alias]
    ] += stat.runs;
  }
  // turn verdict run sums to percent
  for (let i = 0; i < runs.length; i++) {
    for (let j = 0; j < runs[i].length; j++) {
      if (assignmentRuns[j])
        runs[i][j] = parseFloat(
          ((runs[i][j] / assignmentRuns[j]) * 100).toFixed(1),
        );
    }
  }

  for (const verdictName of ORDERED_VERDICTS) {
    if (!verdictsList.includes(verdictName)) {
      continue;
    }
    series.push({
      name: verdictName,
      data: runs[verdictsList.indexOf(verdictName)],
    });
  }

  return series;
});

function getStatistic(
  name:
    | 'variance'
    | 'average'
    | 'avg_runs'
    | 'completed_score_percentage'
    | 'high_score_percentage'
    | 'low_score_percentage'
    | 'maximum'
    | 'minimum',
): number[] {
  return props.problemStats.map((problem) =>
    parseFloat((problem[name] || 0).toFixed(1)),
  );
}

// yLabel = '{y}' or '{y} %'
// yName = data type (percentage, score, etc.)
// data = getStatistic("chart_type")
// yMax = get maxPoints or getMaxStat
function createChartOptions(
  title: string,
  yLabel: string,
  yName: string,
  data: number[],
  yMax: number,
  probs: string[],
) {
  return {
    chart: {
      type: 'bar',
      height: data.length < 15 ? null : `${data.length * 3}%`,
    },
    title: {
      text: title,
    },
    xAxis: {
      categories: probs,
      title: T.wordsProblem,
      min: 0,
    },
    yAxis: {
      min: 0,
      max: yMax,
      title: yName,
    },
    tooltip: {},
    plotOptions: {
      bar: {
        dataLabels: {
          enabled: true,
          format: yLabel,
        },
      },
    },
    series: [
      {
        name: yName,
        data: data,
        pointWidth: 15,
      },
    ],
  };
}

// get chart options
const varianceChartOptions = computed(() => {
  return createChartOptions(
    T.courseStatisticsScoreVariance,
    '{y}',
    T.courseStatisticsVariance,
    getStatistic('variance'),
    getMaxStat('variance'),
    problems.value,
  );
});
const averageChartOptions = computed(() => {
  return createChartOptions(
    T.courseStatisticsAverageScore,
    '{y}',
    T.wordsScore,
    getStatistic('average'),
    maxPoints.value,
    problems.value,
  );
});
const highScoreChartOptions = computed(() => {
  return createChartOptions(
    T.courseStatisticsStudentsAbove,
    '{y} %',
    T.wordsPercentage,
    getStatistic('high_score_percentage'),
    100,
    problems.value,
  );
});
const completedScoreChartOptions = computed(() => {
  return createChartOptions(
    T.courseStatisticsStudentsCompleted,
    '{y} %',
    T.wordsPercentage,
    getStatistic('completed_score_percentage'),
    100,
    problems.value,
  );
});
const lowScoreChartOptions = computed(() => {
  return createChartOptions(
    T.courseStatisticsStudentsScored,
    '{y} %',
    T.wordsPercentage,
    getStatistic('low_score_percentage'),
    100,
    problems.value,
  );
});
const minimumChartOptions = computed(() => {
  return createChartOptions(
    T.courseStatisticsMinimumScore,
    '{y}',
    T.wordsScore,
    getStatistic('minimum'),
    maxPoints.value,
    problems.value,
  );
});
const maximumChartOptions = computed(() => {
  return createChartOptions(
    T.courseStatisticsMaximumScore,
    '{y}',
    T.wordsScore,
    getStatistic('maximum'),
    maxPoints.value,
    problems.value,
  );
});
const runsChartOptions = computed(() => {
  return createChartOptions(
    T.courseStatisticsAverageRuns,
    '{y}',
    T.wordsRuns,
    getStatistic('avg_runs'),
    getMaxStat('avg_runs'),
    problems.value,
  );
});
const verdictChartOptions = computed(() => {
  return {
    chart: {
      type: 'bar',
      height:
        problems.value.length < 15 ? null : `${problems.value.length * 3}%`,
    },
    title: {
      text: T.courseStatisticsVerdicts,
    },
    xAxis: {
      categories: problems.value,
      title: T.wordsProblem,
      min: 0,
    },
    yAxis: {
      min: 0,
      max: 100,
      title: T.wordsRuns,
      reversedStacks: false,
    },
    tooltip: {},
    plotOptions: {
      series: {
        stacking: 'normal',
        pointWidth: 15,
      },
      bar: {
        dataLabels: {
          enabled: true,
          format: '{y} %',
        },
      },
    },
    series: verdictStats.value,
  };
});

// chart options
const selected = ref(completedScoreChartOptions.value);
const options = computed(() => [
  { value: averageChartOptions.value, text: T.courseStatisticsAverageScore },
  {
    value: completedScoreChartOptions.value,
    text: T.courseStatisticsStudentsCompleted,
  },
  {
    value: highScoreChartOptions.value,
    text: T.courseStatisticsStudentsAbove,
  },
  {
    value: lowScoreChartOptions.value,
    text: T.courseStatisticsStudentsScored,
  },
  { value: runsChartOptions.value, text: T.courseStatisticsAverageRuns },
  { value: verdictChartOptions.value, text: T.courseStatisticsVerdicts },
  { value: varianceChartOptions.value, text: T.courseStatisticsVariance },
  { value: minimumChartOptions.value, text: T.courseStatisticsMinimumScore },
  { value: maximumChartOptions.value, text: T.courseStatisticsMaximumScore },
]);
</script>
