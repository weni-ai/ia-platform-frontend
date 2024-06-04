import { shallowMount, createLocalVue } from '@vue/test-utils';
import RepositoryLog from '@/views/repository/Log';
import store from '@/store';
import Buefy from 'buefy';
import VueRouter from 'vue-router';
import UnnnicSystemPlugin from '@/utils/UnnnicSystemPlugin';

const localVue = createLocalVue();
localVue.use(Buefy);

const router = new VueRouter();

localVue.use(VueRouter);
localVue.use(UnnnicSystemPlugin);

describe('RepositoryLog.vue', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(RepositoryLog, {
      localVue,
      store,
      router,
      mocks: {
        $t: () => 'some specific text',
      },
    });
  });

  test('renders correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
