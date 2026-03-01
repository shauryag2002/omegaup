import mitt from 'mitt';

type Events = {
  'update:activeTab': string;
};

const eventBus = mitt<Events>();
export default eventBus;
