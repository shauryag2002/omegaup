<template>
  <b-card :title="T.problemCreatorAdd">
    <form ref="form" @submit.prevent="addItemToStore">
      <div class="h-100">
        <b-tabs small pills lazy>
          <b-tab
            :active="tab === 'case'"
            name="modal-form"
            @click="tab = 'case'"
          >
            <template #title>
              <span name="group" data-problem-creator-add-panel-tab="case">
                {{ T.problemCreatorCase }}</span
              >
            </template>
            <b-alert
              v-model="invalidCaseName"
              variant="danger"
              class="mt-2"
              dismissible
            >
              {{ T.problemCreatorCannotHaveSameName }}</b-alert
            >
            <CaseInput ref="caseInputRef" />
          </b-tab>
          <b-tab
            :active="tab === 'group'"
            name="modal-form"
            @click="tab = 'group'"
          >
            <template #title>
              <span name="group" data-problem-creator-add-panel-tab="group">
                {{ T.problemCreatorGroup }}</span
              >
            </template>
            <b-alert
              v-model="invalidGroupName"
              variant="danger"
              class="mt-2"
              dismissible
            >
              {{ T.problemCreatorCannotHaveSameName }}</b-alert
            >
            <GroupInput ref="groupInputRef" />
          </b-tab>
          <b-tab
            :active="tab === 'multiplecases'"
            name="modal-form"
            @click="tab = 'multiplecases'"
          >
            <template #title>
              <span
                name="multiple-cases"
                data-problem-creator-add-panel-tab="multiple-cases"
              >
                {{ T.problemCreatorMultipleCases }}</span
              >
            </template>
            <b-alert
              v-model="invalidCaseName"
              variant="danger"
              class="mt-2"
              dismissible
            >
              {{ T.problemCreatorCannotHaveSameName }}</b-alert
            >
            <MultipleCasesInput ref="multipleCasesInputRef" />
          </b-tab>
        </b-tabs>
      </div>
      <b-button
        variant="danger"
        size="sm"
        class="mr-2"
        @click="emit('close-add-window')"
        >{{ T.wordsCancel }}</b-button
      >
      <b-button
        data-problem-creator-add-panel-submit
        type="submit"
        variant="success"
        size="sm"
        >{{ T.problemCreatorAdd }}</b-button
      >
    </form>
  </b-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import store from '../../../../problem/creator/store';
import T from '../../../../lang';
import CaseInput from './CaseInput.vue';
import MultipleCasesInput from './MultipleCasesInput.vue';
import GroupInput from './GroupInput.vue';
import {
  Group,
  CaseRequest,
  MultipleCaseAddRequest,
  AddTabTypes,
} from '@/js/omegaup/problem/creator/types';
import { NIL, v4 as uuid } from 'uuid';

const emit = defineEmits<{
  (e: 'close-add-window'): void;
}>();

const tab = ref<AddTabTypes>('case');
const invalidCaseName = ref(false);
const invalidGroupName = ref(false);

const multipleCasesInputRef = ref<InstanceType<typeof MultipleCasesInput>>();
const caseInputRef = ref<InstanceType<typeof CaseInput>>();
const groupInputRef = ref<InstanceType<typeof GroupInput>>();

function addItemToStore() {
  invalidCaseName.value = false;
  invalidGroupName.value = false;

  const groups: Group[] = store.state.casesStore.groups;

  if (tab.value === 'case') {
    // Case Input
    const caseName = caseInputRef.value!.caseName;
    const caseGroup = caseInputRef.value!.caseGroup;
    const casePoints = caseInputRef.value!.casePoints;
    const caseAutoPoints = caseInputRef.value!.caseAutoPoints;

    // Check if there is a group/case with the same name already
    if (caseGroup === NIL) {
      // In this case we just need to check if there is a group with the same name. Since every time a new ungrouped case is created, a corresponding group is created too
      const nameAlreadyExists = groups.find((g) => g.name === caseName);
      if (nameAlreadyExists) {
        invalidCaseName.value = true;
        return;
      }
    } else {
      const group = groups.find((g) => g.groupID === caseGroup);
      if (!group) return;
      const nameAlreadyExists = group.cases.find((c) => c.name === caseName);
      if (nameAlreadyExists) {
        invalidCaseName.value = true;
        return;
      }
    }

    store.commit('casesStore/addCase', {
      caseID: uuid(),
      groupID: caseGroup,
      name: caseName,
      points: casePoints,
      autoPoints: caseAutoPoints,
    } as CaseRequest);
  } else if (tab.value === 'group') {
    const groupName = groupInputRef.value!.groupName;
    const groupPoints = groupInputRef.value!.groupPoints;
    const groupAutoPoints = groupInputRef.value!.groupAutoPoints;

    // Check if there is a group with the same name already
    const nameAlreadyExists = groups.find((g) => g.name === groupName);
    if (nameAlreadyExists) {
      invalidGroupName.value = true;
      return;
    }

    store.commit('casesStore/addGroup', {
      groupID: uuid(),
      name: groupName,
      points: groupPoints,
      autoPoints: groupAutoPoints,
      ungroupedCase: false,
      cases: [],
    } as Group);
  } else if (tab.value === 'multiplecases') {
    const multipleCasesPrefix = multipleCasesInputRef.value!
      .multipleCasesPrefix;
    const multipleCasesSuffix = multipleCasesInputRef.value!
      .multipleCasesSuffix;
    const multipleCasesCount = multipleCasesInputRef.value!.multipleCasesCount;
    const multipleCasesGroup = multipleCasesInputRef.value!.multipleCasesGroup;

    const multipleCaseNameArray = Array.from(
      { length: multipleCasesCount },
      (_, i) => multipleCasesPrefix + `${i + 1}` + multipleCasesSuffix,
    );

    const multipleCaseRequest: MultipleCaseAddRequest = {
      groupID: multipleCasesGroup,
      numberOfCases: multipleCasesCount,
      prefix: multipleCasesPrefix,
      suffix: multipleCasesSuffix,
    };

    if (multipleCasesGroup === NIL) {
      // In this case we just need to check if there is a group with the same name. Since every time a new ungrouped case is created, a corresponding group is created too
      const nameAlreadyExists = groups.find((g) =>
        multipleCaseNameArray.includes(g.name),
      );
      if (nameAlreadyExists) {
        invalidCaseName.value = true;
        return;
      }
      store.dispatch('casesStore/addMultipleCases', multipleCaseRequest);
      emit('close-add-window');
      return;
    }
    const group = groups.find((g) => g.groupID === multipleCasesGroup);
    if (!group) return;
    const nameAlreadyExists = group.cases.find((c) =>
      multipleCaseNameArray.includes(c.name),
    );
    if (nameAlreadyExists) {
      invalidCaseName.value = true;
      return;
    }
    store.dispatch('casesStore/addMultipleCases', multipleCaseRequest);
    emit('close-add-window');
    return;
  }
  emit('close-add-window');
}
</script>
