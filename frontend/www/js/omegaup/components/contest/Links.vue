<template>
  <div class="card">
    <h4 class="card-header">{{ T.contestEditAdministrativeLinks }}</h4>
    <div class="card-body">
      <div class="list-group w-50 mx-auto">
        <a class="list-group-item" :href="`/arena/${contest.alias}/#runs`">{{
          T.wordsSubmissions
        }}</a>
        <a class="list-group-item" :href="`/contest/${contest.alias}/stats/`">{{
          T.profileStatistics
        }}</a>
        <a
          class="list-group-item"
          :href="`/contest/${contest.alias}/activity/`"
          >{{ T.activityReport }}</a
        >
        <a class="list-group-item" :href="`/arena/${contest.alias}/print/`">{{
          T.contestPrintableVersion
        }}</a>
        <a
          class="list-group-item"
          :href="`/arena/${contest.alias}/scoreboard/${contest.scoreboard_url}`"
          >{{ T.contestScoreboardLink }}</a
        >
        <a
          class="list-group-item"
          :href="`/arena/${contest.alias}/scoreboard/${contest.scoreboard_url_admin}`"
          >{{ T.contestScoreboardAdminLink }}</a
        >
        <a
          class="list-group-item"
          href="#"
          @click="onDownloadCsv(contest.alias)"
          >{{ T.contestScoreboardDownloadCsvFile }}</a
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { types } from '../../api_types';
import T from '../../lang';

const props = defineProps<{
  data: types.Contest;
}>();

const emit = defineEmits<{
  (e: 'download-csv-scoreboard', contestAlias: string): void;
}>();

const contest = props.data;

function onDownloadCsv(contestAlias: string): void {
  emit('download-csv-scoreboard', contestAlias);
}
</script>
