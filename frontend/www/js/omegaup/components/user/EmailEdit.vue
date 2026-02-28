<template>
  <div class="container-fluid p-0 mt-0" data-user-edit-email>
    <div class="row">
      <div class="col-md-2">
        <OmegaupUserMaininfo :profile="profile" :edit="true" />
      </div>
      <div class="col-md-10">
        <div class="card">
          <h2 class="card-header">{{ T.userEmailEditEmail }}</h2>
          <div class="card-body">
            <form
              class="form-horizontal"
              @submit.prevent="emit('submit', currentEmail)"
            >
              <div class="form-group">
                <label class="col-md-3 control-label" for="email">{{
                  T.userEmailEditEmail
                }}</label>
                <div class="col-md-7">
                  <input
                    v-model="currentEmail"
                    class="form-control"
                    name="email"
                    size="30"
                    type="text"
                  />
                </div>
              </div>
              <div class="form-group">
                <div class="col-md-offset-3 col-md-7">
                  <button class="btn btn-primary" type="submit">
                    {{ T.wordsSaveChanges }}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import T from '../../lang';
import { types } from '../../api_types';
import OmegaupUserMaininfo from './MainInfo.vue';

const props = defineProps<{
  email: string;
  profile: types.UserProfileInfo;
}>();

const emit = defineEmits<{
  (e: 'submit', email: string): void;
}>();

const currentEmail = ref(props.email);
</script>
