import { shallowMount, createLocalVue } from '@vue/test-utils';
import store from '@/store';
import Router from 'vue-router';
import RepositoryCardList from '@/components/repository/RepositoryCardList';
import Buefy from 'buefy';

const localVue = createLocalVue();
localVue.use(Buefy);
localVue.use(Router);

describe('RepositoryCardList.vue', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(RepositoryCardList, {
      localVue,
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
