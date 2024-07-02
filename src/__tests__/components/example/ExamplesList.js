import { shallowMount, createLocalVue } from '@vue/test-utils';
import API from '@/utils/plugins/API';
import ExamplesList from '@/components/example/ExamplesList';
import Vuex from 'vuex';
import Buefy from 'buefy';

const localVue = createLocalVue();

localVue.use(API);
localVue.use(Vuex);
localVue.use(Buefy);

describe('ExamplesList.vue', () => {
  let wrapper;
  let state;
  let store;
  let getters;
  let actions;

  beforeEach(() => {
    state = {
      selectedRepository: {
        uuid: '8511fd26-a3bc-4f74-9af1-176abca5401d',
        repository_version_id: '1.0.0',
      },
    };

    getters = {
      getCurrentRepository: () => state.selectedRepository,
      getSelectedVersion: () => state.selectedRepository.repository_version_id,
    };

    actions = {
      searchExamples: jest.fn(() =>
        Promise.resolve({
          count: 1,
          results: [
            {
              status: 2,
              created_at: '2021-01-01T00:00:00Z',
            },
          ],
        }),
      ),
      getRepositoryStatusTraining: jest.fn(() =>
        Promise.resolve({
          data: {
            count: 1,
            results: [
              {
                status: 2,
                created_at: '2021-01-01T00:00:00Z',
              },
            ],
          },
        }),
      ),
      loadSelectedRepository: jest.fn(() => Promise.resolve()), // Mock da ação loadSelectedRepository
    };

    store = new Vuex.Store({
      modules: {
        Repository: {
          namespaced: true,
          state,
          getters,
          actions,
        },
      },
    });

    wrapper = shallowMount(ExamplesList, {
      localVue,
      store,
      mocks: {
        $t: () => 'some specific text',
      },
      propsData: {
        query: {},
        perPage: 50,
        update: false,
        textData: '',
        translationData: null,
      },
    });
  });

  test('renders correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });

  test('calls updateExamples on mount', async () => {
    await wrapper.vm.$nextTick(); // Wait for any pending updates
    expect(actions.getRepositoryStatusTraining).toHaveBeenCalled();
    expect(actions.searchExamples).toHaveBeenCalledWith({
      repositoryUuid: state.selectedRepository.uuid,
      version: state.selectedRepository.repository_version_id,
      query: {},
      limit: 50,
      endCreatedAt: '2021-01-01 00:00:00',
    });
  });

  // describe('update list', () => {
  //   beforeEach(async () => {
  //     wrapper.vm.updateExamples();
  //     await wrapper.vm.examplesList.updateItems(0);
  //   });

  //   test('have items', () => {
  //     expect(wrapper.vm.examplesList.items.length).toBeGreaterThan(0);
  //   });
  // });
});
