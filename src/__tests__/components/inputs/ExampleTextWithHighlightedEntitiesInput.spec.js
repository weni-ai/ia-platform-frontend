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

    /* describe('select text', () => {
      let wrapper;

      beforeEach(() => {
        wrapper = shallowMount(ExampleTextWithHighlightedEntitiesInput, {
          localVue,
          mocks: {
            $t: () => 'some specific text',
          },
          stubs: {
            'self-adjust-input': {
              template: '<input ref="input" @select="$listeners.select">',
            },
          },
        });
      });

      test('textSelected event emitted', async () => {
        const input = wrapper.findComponent({ ref: 'input' });

        // Simulando o método setSelectionRange no elemento
        input.element.setSelectionRange = jest.fn();

        // Definindo o intervalo de seleção
        input.element.selectionStart = 0;
        input.element.selectionEnd = 2;

        // Disparando o evento select para simular a seleção de texto
        await input.trigger('select');

        // Verificando se o evento textSelected foi emitido
        expect(wrapper.emitted('textSelected')).toBeDefined();
        expect(wrapper.emitted('textSelected')[0]).toEqual([
          { start: 0, end: 2 },
        ]);
      });
    });*/
  });
});
