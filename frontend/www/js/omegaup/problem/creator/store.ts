import Vue from 'vue';
import Vuex from 'vuex';
import { StoreState } from './types';
import { casesStore } from './modules/cases';
import T from '../../lang';

Vue.use(Vuex);

const draftStorageKey = 'problemCreatorDraft';

const defaultState: StoreState = {
  problemName: T.problemCreatorNewProblem,
  problemMarkdown: T.problemCreatorEmpty,
  problemCodeContent: T.problemCreatorEmpty,
  problemCodeExtension: T.problemCreatorEmpty,
  problemSolutionMarkdown: T.problemCreatorEmpty,
} as StoreState;

function loadDraft(): Partial<StoreState> & { casesStore?: unknown } {
  if (typeof window === 'undefined') {
    return {};
  }
  const raw = window.localStorage.getItem(draftStorageKey);
  if (!raw) {
    return {};
  }
  try {
    return JSON.parse(raw) as Partial<StoreState> & { casesStore?: unknown };
  } catch (err) {
    console.error('Failed to parse problem creator draft', err);
    return {};
  }
}

const store = new Vuex.Store({
  state: { ...defaultState },
  modules: {
    casesStore,
  },
  mutations: {
    updateSolutionMarkdown(state: StoreState, newSolutionMarkdown: string) {
      state.problemSolutionMarkdown = newSolutionMarkdown;
    },
    updateMarkdown(state: StoreState, newMarkdown: string) {
      state.problemMarkdown = newMarkdown;
    },
    updateName(state: StoreState, newName: string) {
      state.problemName = newName;
    },
    updateCodeContent(state: StoreState, newContent: string) {
      state.problemCodeContent = newContent;
    },
    updateCodeExtension(state: StoreState, newExtension: string) {
      state.problemCodeExtension = newExtension;
    },
    resetStore(state: StoreState) {
      state.problemName = T.problemCreatorNewProblem;
      state.problemMarkdown = T.problemCreatorEmpty;
      state.problemCodeContent = T.problemCreatorEmpty;
      state.problemCodeExtension = T.problemCreatorEmpty;
      state.problemSolutionMarkdown = T.problemCreatorEmpty;
    },
  },
});

const draft = loadDraft();
if (draft.problemName) {
  store.state.problemName = draft.problemName;
}
if (draft.problemMarkdown) {
  store.state.problemMarkdown = draft.problemMarkdown;
}
if (draft.problemCodeContent) {
  store.state.problemCodeContent = draft.problemCodeContent;
}
if (draft.problemCodeExtension) {
  store.state.problemCodeExtension = draft.problemCodeExtension;
}
if (draft.problemSolutionMarkdown) {
  store.state.problemSolutionMarkdown = draft.problemSolutionMarkdown;
}
if (draft.casesStore) {
  store.commit('casesStore/replaceState', draft.casesStore);
}

store.subscribe((_mutation, state) => {
  if (typeof window === 'undefined') {
    return;
  }
  const snapshot = {
    problemName: state.problemName,
    problemMarkdown: state.problemMarkdown,
    problemCodeContent: state.problemCodeContent,
    problemCodeExtension: state.problemCodeExtension,
    problemSolutionMarkdown: state.problemSolutionMarkdown,
    casesStore: state.casesStore,
  };
  window.localStorage.setItem(draftStorageKey, JSON.stringify(snapshot));
});

export default store;
