import VueMoment from 'vue-moment';
import Buefy from 'buefy';

import { shallowMount, createLocalVue } from '@vue/test-utils';
import applyFilters from '@/utils/filters';
import store from '@/store';
import TranslationItem from '@/components/translate/TranslationItem';

const localVue = createLocalVue();
localVue.use(VueMoment);
localVue.use(Buefy);

applyFilters(localVue);

describe('TranslationItem.vue', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(TranslationItem, {
      localVue,
      store,
      mocks: {
        $t: () => 'some specific text',
      },
      propsData: {
        id: 1,
        original_example: 1,
        text: 'oi',
        entities: [],
        from_language: 'en',
        language: 'pt',
        created_at: '2018-05-29T13:37:53.853592Z',
      },
    });
  });

  test('renders correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
