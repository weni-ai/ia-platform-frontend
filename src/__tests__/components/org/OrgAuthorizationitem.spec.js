import Buefy from 'buefy';
import { shallowMount, createLocalVue } from '@vue/test-utils';
import store from '@/store';
import applyFilters from '@/utils/filters';
import OrgAuthorizationItem from '@/components/org/OrgAuthorizationItem';

const localVue = createLocalVue();
localVue.use(Buefy);
applyFilters(localVue);

describe('AuthorizationItem.vue', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(OrgAuthorizationItem, {
      localVue,
      mocks: {
        $t: () => 'some specific text',
      },
      propsData: {
        uuid: 'de6e3f36-833f-4ef8-a3da-c576ea606139',
        user__nickname: 'douglas',
        organization__nickname: 'org',
        organization: 5,
        role: 3,
        can_read: true,
        can_contribute: true,
        can_write: true,
      },
      store,
    });
  });

  test('mount', () => {
    expect(wrapper.vm).toBeDefined();
  });
});
