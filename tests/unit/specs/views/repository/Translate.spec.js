import { shallowMount, createLocalVue } from '@vue/test-utils';
import Translate from '@/views/repository/Translate.vue';
import store from '@/store';
import VueRouter from 'vue-router';

const router = new VueRouter();

const localVue = createLocalVue();

localVue.use(VueRouter);

describe('Translate.vue', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(Translate, {
      localVue,
      router,
      store,
      mocks: {
        $t: () => 'some specific text',
      },
    });
  });

  test('renders correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
