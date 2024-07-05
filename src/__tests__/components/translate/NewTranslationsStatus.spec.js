import { shallowMount, createLocalVue } from '@vue/test-utils';
import TranslationsStatus from '@/components/translate/NewTranslationsStatus';
import applyFilters from '@/utils/filters';

import store from '@/store';
import Buefy from 'buefy';

const localVue = createLocalVue();
localVue.use(Buefy);
applyFilters(localVue);

describe('TranslationsStatus.vue', () => {
  let wrapper;
  beforeEach(async () => {
    wrapper = shallowMount(TranslationsStatus, {
      localVue,
      store,
      mocks: {
        $t: () => 'some specific text',
      },
      propsData: {
        ownerNickname: 'douglas',
        repositorySlug: 'repo1',
        repositoryUuid: '1234',
      },
    });
    await wrapper.vm.updateTranslationsStatus();
  });

  test('renders correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });

  describe('update ownerNickname and repositorySlug to invalid repository', () => {
    beforeEach(async () => {
      wrapper.setProps({
        ownerNickname: 'fake',
        repositorySlug: 'repo2',
      });
      await wrapper.vm.updateTranslationsStatus();
    });

    test('empty filteredLanguagesStatus', () => {
      expect(wrapper.vm.filteredLanguagesStatus).toHaveLength(0);
    });
  });
});
