import { shallowMount, createLocalVue } from '@vue/test-utils';
import EvaluateManual from '@/views/repository/EvaluateManual';

import Vuex from 'vuex';
import Buefy from 'buefy';

const localVue = createLocalVue();
localVue.use(Buefy);
localVue.use(Vuex);

describe('EvaluateManual.vue', () => {
  let wrapper;
  let state;
  let store;
  let actions;
  let getters;
  beforeEach(() => {
    state = {
      selectedRepository: {
        uuid: 'dbe1539c-88ba-43e0-bed5-54729218cec9',
      },
    };
    actions = {
      getEvaluateExample: jest.fn(),
      runNewEvaluate: jest.fn(),
      setUpdateRepository: jest.fn(),
      setRepositoryVersion: jest.fn(),
    };
    getters = {
      authenticated: jest.fn(),
      getUpdateRepositoryState: jest.fn(),
      getSelectedVersion: jest.fn(),
      activeTutorial: jest.fn()

    };
    store = new Vuex.Store({
      modules: {
        Repository: {
          state,
          getters,
          actions,
        },
      },
    });
    wrapper = shallowMount(EvaluateManual, {
      localVue,
      store,
      mocks: {
        $t: () => 'some specific text',
        $route: {
          name: 'repository-result',
          params: {
            ownerNickname: 'teste-pubngj',
            slug: 'teste-privado',
            resultId: 3525,
            version: 2,
          },
        }
      }
    });
  });

  test('renders correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('run new test', () => {
    expect(wrapper.vm.newEvaluate()).toBeTruthy();
  });
});


