import Buefy from 'buefy';

import Vuex from 'vuex';
import { shallowMount, createLocalVue } from '@vue/test-utils';
import store from '@/store';
import AuthorizationRequestItem from '@/components/repository/AuthorizationRequestItem';

const localVue = createLocalVue();
localVue.use(Buefy);
localVue.use(Vuex);

describe('AuthorizationRequestItem.vue', () => {
  let wrapper;
  const mountComponent = (options = {}) =>
    shallowMount(AuthorizationRequestItem, {
      localVue,
      mocks: {
        $t: () => 'some specific text',
      },
      store,
      propsData: {
        id: 1,
        user__nickname: 'fake',
        text: 'I can contribute',
      },
      ...options,
    });
  beforeEach(() => {
    store.replaceState({
      Auth: {
        token: '1f5e7e21d331536b58448595f69eb50a6b5e49b8',
      },
      User: {
        profiles: {},
      },
    });
    wrapper = mountComponent();
  });

  test('mount', () => {
    expect(wrapper.vm).toBeDefined();
  });
});
