<template>
  <div class="h-77 overflow-auto">
    <div
      v-for="layout in getAllLayouts"
      :key="layout.layoutID"
      class="d-flex justify-content-center"
    >
      <b-modal
        v-model="showRenameModal[layout.layoutID]"
        size="sm"
        data-layout-dropdown-rename-modal
        :title="T.problemCreatorRenameModalTitle"
        :ok-title="T.problemCreatorRenameModalRename"
        ok-variant="success"
        :cancel-title="T.problemCreatorRenameModalBack"
        cancel-variant="danger"
        static
        lazy
        @ok="
          editLayoutName([
            layout.layoutID,
            editLayoutModalName[layout.layoutID],
          ])
        "
      >
        <b-form-input
          v-model="editLayoutModalName[layout.layoutID]"
          data-layout-sidebar-rename-layout
        />
      </b-modal>
      <b-card no-body class="w-84 mb-2">
        <b-card-header class="p-0">
          <b-dropdown
            block
            split
            right
            :data-layout-dropdown="layout.layoutID"
            :text="layout.name"
            variant="primary"
            @click="showLayout[layout.layoutID] = !showLayout[layout.layoutID]"
          >
            <b-dropdown-item
              data-layout-dropdown-rename-layout
              @click="
                showRenameModal[layout.layoutID] =
                  !showRenameModal[layout.layoutID]
              "
            >
              <div class="d-flex">
                <FontAwesomeIcon :icon="['fas', 'pencil']" class="pt-1 mr-3" />
                {{ T.problemCreatorRenameLayout }}
              </div>
            </b-dropdown-item>
            <b-dropdown-item
              data-layout-dropdown-enforce-to-selected
              @click="enforceLayoutToTheSelectedCase(layout.layoutID)"
            >
              <div class="d-flex">
                <FontAwesomeIcon
                  :icon="['fas', 'arrows-left-right']"
                  class="pt-1 mr-3"
                />
                {{ T.problemCreatorLayoutLoadToSelected }}
              </div>
            </b-dropdown-item>
            <b-dropdown-item
              data-layout-dropdown-enforce-to-all
              @click="enforceLayoutToAllCases(layout.layoutID)"
            >
              <div class="d-flex">
                <FontAwesomeIcon
                  :icon="['fas', 'arrows-rotate']"
                  class="pt-1 mr-3"
                />
                {{ T.problemCreatorLayoutLoadToAll }}
              </div>
            </b-dropdown-item>
            <b-dropdown-item
              data-layout-dropdown-copy
              @click="copyLayout(layout.layoutID)"
            >
              <div class="d-flex">
                <FontAwesomeIcon
                  :icon="['fas', 'download']"
                  class="pt-1 mr-3"
                />
                {{ T.problemCreatorLayoutCopy }}
              </div>
            </b-dropdown-item>
            <b-dropdown-item
              data-layout-dropdown-delete
              @click="removeLayout(layout.layoutID)"
            >
              <div class="d-flex">
                <FontAwesomeIcon :icon="['fas', 'trash']" class="pt-1 mr-3" />
                {{ T.problemCreatorLayoutDelete }}
              </div>
            </b-dropdown-item>
          </b-dropdown>
        </b-card-header>
        <b-collapse v-model="showLayout[layout.layoutID]">
          <div>
            <table class="table">
              <tbody>
                <tr v-for="lineInfo in layout.caseLineInfos">
                  <td class="align-middle border-0">
                    <b-container fluid class="bg-light">
                      <b-row
                        class="d-flex justify-content-between"
                        align-v="center"
                      >
                        <b-col cols="4" class="mt-2 mb-2 pl-2 pr-1">
                          <b-form-input
                            v-model="lineInfo.label"
                            size="sm"
                            :placeholder="T.problemCreatorLabelPlaceHolder"
                          />
                        </b-col>
                        <b-col cols="6" class="pl-0 pr-0 text-center">
                          <b-dropdown
                            data-line-info-dropdown
                            :text="getLineNameFromKind(lineInfo.data.kind)"
                            variant="light"
                          >
                            <b-dropdown-item
                              v-for="lineKindOption in lineKindOptions"
                              :key="lineKindOption.kind"
                              :data-line-info-dropdown-item="
                                lineKindOption.kind
                              "
                              @click="
                                editLineInfoKind([
                                  layout.layoutID,
                                  lineInfo.lineInfoID,
                                  lineKindOption.kind,
                                ])
                              "
                            >
                              {{ lineKindOption.kind }}
                            </b-dropdown-item>
                          </b-dropdown>
                          <b-button
                            v-if="
                              getEditIconDisplay(lineInfo) ===
                              EditIconDisplayOption.EDIT_ICON
                            "
                            size="sm"
                            type="button"
                            :title="T.problemCreatorLineEdit"
                            variant="light"
                          >
                            <FontAwesomeIcon :icon="['fas', 'pen-to-square']" />
                          </b-button>
                        </b-col>
                        <b-col cols="2">
                          <b-button
                            size="sm"
                            type="button"
                            :title="T.problemCreatorLineDelete"
                            variant="light"
                            @click="
                              removeLineInfoFromLayout([
                                layout.layoutID,
                                lineInfo.lineInfoID,
                              ])
                            "
                          >
                            <FontAwesomeIcon :icon="['fas', 'trash-can']" />
                          </b-button>
                        </b-col>
                      </b-row>
                    </b-container>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="text-center mb-2">
            <b-button
              data-layout-add-line-info
              variant="light"
              class="mr-2"
              @click="addNewLineInfoToLayout(layout.layoutID)"
            >
              <div class="container">
                <div class="row">
                  <FontAwesomeIcon
                    :icon="['fas', 'square-plus']"
                    class="mr-2 pt-1"
                  />
                  {{ T.problemCreatorLayoutAddLineInfo }}
                </div>
              </div>
            </b-button>
          </div>
        </b-collapse>
      </b-card>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed, watch } from 'vue';
import { useStore } from 'vuex';
import T from '../../../../lang';
import {
  BButton,
  BCard,
  BCardHeader,
  BCol,
  BCollapse,
  BContainer,
  BDropdown,
  BDropdownItem,
  BFormInput,
  BModal,
  BRow,
} from 'bootstrap-vue-next';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faArrowsLeftRight,
  faArrowsRotate,
  faDownload,
  faPenToSquare,
  faPencil,
  faSquarePlus,
  faTrash,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons';
library.add(
  faArrowsLeftRight,
  faArrowsRotate,
  faDownload,
  faPenToSquare,
  faPencil,
  faSquarePlus,
  faTrash,
  faTrashCan,
);
import {
  Layout,
  LayoutID,
  CaseLineKind,
  LineInfoID,
  Group,
  CaseLineInfo,
} from '@/js/omegaup/problem/creator/types';

export default defineComponent({
  name: 'LayoutSidebar',
  setup() {
    const store = useStore();

    const groups = computed<Group[]>(() => store.state.casesStore.groups);
    const getAllLayouts = computed<Layout[]>(
      () => store.getters['casesStore/getAllLayouts'],
    );

    const showLayout = reactive<{ [key: LayoutID]: boolean }>({});
    const showRenameModal = reactive<{ [key: LayoutID]: boolean }>({});
    const editLayoutModalName = reactive<{ [key: LayoutID]: string }>({});

    watch(getAllLayouts, (layouts) => {
      for (const layout of layouts) {
        showLayout[layout.layoutID] = false;
        showRenameModal[layout.layoutID] = false;
        editLayoutModalName[layout.layoutID] = layout.name;
      }
    });

    const enforceLayoutToTheSelectedCase = (layoutID: LayoutID) =>
      store.commit('casesStore/enforceLayoutToTheSelectedCase', layoutID);
    const addNewLineInfoToLayout = (layoutID: LayoutID) =>
      store.commit('casesStore/addNewLineInfoToLayout', layoutID);
    const editLineInfoKind = (payload: [LayoutID, LineInfoID, CaseLineKind]) =>
      store.commit('casesStore/editLineInfoKind', payload);
    const enforceLayoutToAllCases = (layoutID: LayoutID) =>
      store.commit('casesStore/enforceLayoutToAllCases', layoutID);
    const copyLayout = (layoutID: LayoutID) =>
      store.commit('casesStore/copyLayout', layoutID);
    const removeLayout = (layoutID: LayoutID) =>
      store.commit('casesStore/removeLayout', layoutID);
    const removeLineInfoFromLayout = (payload: [LayoutID, LineInfoID]) =>
      store.commit('casesStore/removeLineInfoFromLayout', payload);
    const editLayoutName = (payload: [LayoutID, string]) =>
      store.commit('casesStore/editLayoutName', payload);

    const EditIconDisplayOption = Object.freeze({
      EDIT_ICON: 'edit_icon',
    });

    const getEditIconDisplay = (lineInfo: CaseLineInfo) => {
      if (lineInfo.data.kind === 'array' || lineInfo.data.kind === 'matrix') {
        return EditIconDisplayOption.EDIT_ICON;
      }
    };

    const lineKindOptions: { type: string; kind: CaseLineKind }[] = [
      { type: T.problemCreatorLineLine, kind: 'line' },
      { type: T.problemCreatorLineMultiline, kind: 'multiline' },
      { type: T.problemCreatorLineArray, kind: 'array' },
      { type: T.problemCreatorLineMatrix, kind: 'matrix' },
    ];

    const getLineNameFromKind = (kind: CaseLineKind) =>
      lineKindOptions.find((line) => line.kind === kind)?.type;

    return {
      T,
      groups,
      getAllLayouts,
      showLayout,
      showRenameModal,
      editLayoutModalName,
      enforceLayoutToTheSelectedCase,
      addNewLineInfoToLayout,
      editLineInfoKind,
      enforceLayoutToAllCases,
      copyLayout,
      removeLayout,
      removeLineInfoFromLayout,
      editLayoutName,
      EditIconDisplayOption,
      getEditIconDisplay,
      lineKindOptions,
      getLineNameFromKind,
    };
  },
});
</script>

<style lang="scss" scoped>
.h-77 {
  height: 77%;
}

.w-84 {
  width: 84%;
}
</style>
