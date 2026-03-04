<template>
  <div class="container-fluid p-0 mt-0">
    <slot name="message"></slot>
    <div class="row">
      <div class="col-md-3 col-lg-3">
        <omegaup-user-maininfo
          :profile="profile"
          :data="data"
          v-model:selected-tab="currentSelectedTab"
          :has-password="hasPassword"
        >
        </omegaup-user-maininfo>
      </div>
      <div class="col-md-9 col-lg-9 sticky-top">
        <div class="card">
          <div class="card-header">
            <slot name="title"></slot>
          </div>
          <div class="card-body">
            <slot name="content"></slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, PropType } from 'vue';
import user_SidebarMainInfo from './SidebarMainInfo.vue';
import { types } from '../../api_types';

export default defineComponent({
  name: 'ProfileWrapper',
  components: {
    'omegaup-user-maininfo': user_SidebarMainInfo,
  },
  props: {
    data: {
      type: Object as PropType<types.ExtraProfileDetails | null>,
      default: null,
    },
    profile: {
      type: Object as PropType<types.UserProfileInfo>,
    },
    selectedTab: {
      type: String as PropType<string | null>,
      default: null,
    },
    hasPassword: {
      type: Boolean,
    },
  },
  emits: ['update:selectedTab'],
  setup(props, { emit }) {
    const currentSelectedTab = ref<string | null>(props.selectedTab);

    watch(
      () => currentSelectedTab.value,
      (newValue) => {
        emit('update:selectedTab', newValue);
      },
    );

    return {
      currentSelectedTab,
    };
  },
});
</script>
