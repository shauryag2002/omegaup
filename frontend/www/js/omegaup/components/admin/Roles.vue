<template>
  <div class="card">
    <h2 class="card-header text-white bg-primary">
      {{ T.omegaupTitleUpdatePrivileges }}
    </h2>
    <div class="card-body">
      <h4>{{ T.userRoles }}</h4>
      <table class="table">
        <tbody>
          <tr v-for="role in currentRoles" :key="role.name">
            <td>
              <input
                v-model="role.value"
                type="checkbox"
                @change.prevent="changeRole($event, role)"
              />
            </td>

            <td>{{ role.name }}</td>
          </tr>
        </tbody>
      </table>
      <h4>{{ T.userGroups }}</h4>
      <table class="table">
        <tbody>
          <tr v-for="group in currentGroups" :key="group.alias">
            <td>
              <input
                v-model="group.value"
                type="checkbox"
                @change.prevent="changeGroup($event, group)"
              />
            </td>

            <td>{{ group.name }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { omegaup } from '../../omegaup';
import { types } from '../../api_types';
import T from '../../lang';

const props = defineProps<{
  roles: types.UserRole[];
  groups: types.Group[];
}>();

const emit = defineEmits<{
  (e: 'change-role', payload: omegaup.Selectable<types.UserRole>): void;
  (e: 'change-group', payload: omegaup.Selectable<types.Group>): void;
}>();

const currentRoles = ref<types.UserRole[]>(props.roles);
const currentGroups = ref<types.Group[]>(props.groups);

function changeRole(ev: Event, role: types.UserRole): void {
  emit('change-role', {
    value: role,
    selected: (ev.target as HTMLInputElement).checked,
  });
}

function changeGroup(ev: Event, group: types.Group): void {
  emit('change-group', {
    value: group,
    selected: (ev.target as HTMLInputElement).checked,
  });
}
</script>
