import { shallowMount, createLocalVue } from '@vue/test-utils';
import ExampleTextWithHighlightedEntitiesInput from '@/components/inputs/ExampleTextWithHighlightedEntitiesInput';
import Buefy from 'buefy';

const localVue = createLocalVue();
localVue.use(Buefy);

describe('ExampleTextWithHighlightedEntitiesInput.vue', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(ExampleTextWithHighlightedEntitiesInput, {
      localVue,
      mocks: {
        $t: () => 'some specific text',
      },
    });
  });

  test('renders correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });

  describe('set text', () => {
    const textareaValue = 'hi kids';
    beforeEach(() => {
      const input = wrapper.findComponent({ ref: 'input' });
      input.element.value = textareaValue;
      input.trigger('input', textareaValue);
    });

    describe('with entity', () => {
      beforeEach(() => {
        wrapper.setProps({ entities: [{ start: 3, end: 7, entity: 'kids' }] });
      });

      test('renders correctly', () => {
        expect(wrapper).toMatchSnapshot();
      });
    });
  });
});
