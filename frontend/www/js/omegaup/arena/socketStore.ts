import Vuex from 'vuex';

export interface SocketState {
  socketStatus: SocketStatus;
}

enum SocketStatus {
  Waiting = '↻',
  Failed = '✗',
  Connected = '•',
}

export const socketStoreConfig = {
  state: {
    socketStatus: SocketStatus.Waiting,
  },
  mutations: {
    updateSocketStatus(state: SocketState, socketStatus: SocketStatus) {
      state.socketStatus = socketStatus;
    },
  },
};

export default new Vuex.Store<SocketState>(socketStoreConfig);
