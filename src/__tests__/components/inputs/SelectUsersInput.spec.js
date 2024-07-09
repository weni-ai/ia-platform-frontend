import Vue from 'vue';
import Buefy from 'buefy';
import store from '@/store';
import { mount, createLocalVue } from '@vue/test-utils';
import SelectUsersInput from '@/components/inputs/SelectUsersInput';

Vue.config.silent = true;
const localVue = createLocalVue();
localVue.use(Buefy);

describe('SelectUsersInput.vue', () => {
  let wrapper;
  const debounceTime = 50;
  beforeEach(() => {
    wrapper = mount(SelectUsersInput, {
      localVue,
      store,
      mocks: {
        $t: () => 'some specific text',
      },
      propsData: {
        debounceTime,
      },
    });
  });

  test('mount', () => {
    expect(wrapper.vm).toBeDefined();
  });
});
