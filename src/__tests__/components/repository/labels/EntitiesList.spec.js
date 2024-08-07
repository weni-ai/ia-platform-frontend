import Vuex from 'vuex';
import { mount, createLocalVue } from '@vue/test-utils';
import EntitiesList from '@/components/repository/EntitiesList';
import Buefy from 'buefy';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(Buefy);

jest.spyOn(EntitiesList, 'mounted').mockImplementation(() => {});
describe('EntitiesList.vue', () => {
  let wrapper;
  let store;
  let getters;
  beforeEach(() => {
    const entity = 'health';
    getters = {
      getCurrentRepository: () => ({
        groups: [{ entities: ['green_robot'] }],
      }),
    };
    store = new Vuex.Store({
      modules: {
        Repository: {
          getters,
        },
      },
    });
    wrapper = mount(EntitiesList, {
      localVue,
      store,
      mocks: {
        $t: () => 'some specific text',
        $tc: () => 'some specific text',
        $route: {
          params: { entity },
        },
      },
      propsData: {
        entitiesList: {
          total: 10,
        },
        entityName: 'health',
        repository: {
          other_group: {
            entities: ['robot', 'greenRobot'],
          },
          groups: {
            entities: ['robot', 'greenRobot'],
          },
          authorization: {
            can_contribute: true,
          },
        },
      },
    });
  });

  test('renders correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });

  describe('click on edit button', () => {
    test('Entity should be de defined', () => {
      expect(wrapper.vm.entityName).toBeDefined();
    });

    test('total of sentences should be greater than 0', () => {
      expect(wrapper.vm.entitiesList.total).toBeGreaterThan(0);
    });
  });
});
