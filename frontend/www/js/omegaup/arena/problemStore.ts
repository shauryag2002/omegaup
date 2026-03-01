import { createStore } from 'vuex';
import { types } from '../api_types';

export interface ProblemState {
  // The mapping of problem alias to indexes on the problems array
  problems: Record<string, types.ProblemInfo>;
}

export const storeConfig = {
  state: {
    problems: {},
  },
  mutations: {
    addProblem(state: ProblemState, problem: types.ProblemInfo) {
      if (Object.prototype.hasOwnProperty.call(state.problems, problem.alias)) {
        return;
      }
      state.problems[problem.alias] = problem;
    },
  },
};

export default createStore<ProblemState>(storeConfig);
