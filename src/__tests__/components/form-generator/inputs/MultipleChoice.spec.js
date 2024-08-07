import { shallowMount, createLocalVue } from '@vue/test-utils';
import MultipleChoice from '@/components/form-generator/inputs/MultipleChoice';
import Buefy from 'buefy';

const localVue = createLocalVue();
localVue.use(Buefy);

describe('MultipleChoice.vue', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(MultipleChoice, {
      propsData: {
        choices: ['pt', 'pt-br', 'en'],
      },
      stubs: {
        transition: false,
        'b-taginput': true,
      },
    });
  });

  test('renders correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
