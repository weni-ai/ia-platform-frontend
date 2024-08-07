import { shallowMount, createLocalVue } from '@vue/test-utils';

import NewTranslateForm from '@/components/translate/NewTranslateForm';
import store from '@/store';
import Buefy from 'buefy';

const localVue = createLocalVue();
localVue.use(Buefy);

describe('NewTranslateForm.vue', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(NewTranslateForm, {
      localVue,
      mocks: {
        $t: () => 'some specific text',
      },
      propsData: {
        exampleId: 1,
        translateTo: 'pt',
        repository: {},
      },
      store,
    });
  });

  test('renders correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });

  test('isValid is false', () => {
    expect(wrapper.vm.isValid).toBeFalsy();
  });

  describe('fill with valid data', () => {
    beforeEach(() => {
      wrapper.vm.text = 'meu nome é douglas';
      wrapper.vm.entities = [
        {
          start: 12,
          end: 19,
          entity: 'name',
        },
      ];
    });

    test('isValid is true', () => {
      expect(wrapper.vm.isValid).toBeTruthy();
    });
  });

  describe('entitiesInput emit entityAdded', () => {
    let entitiesInput;
    beforeEach(() => {
      entitiesInput = wrapper.findComponent({ ref: 'entitiesInput' });
      entitiesInput.vm.$emit('entityAdded', {});
    });

    test('entityAdded event emitted by entitiesInput', () => {
      expect(entitiesInput.emitted('entityAdded')).toBeDefined();
    });
  });

  describe('entitiesInput emit entityEdited', () => {
    let entitiesInput;
    beforeEach(() => {
      entitiesInput = wrapper.findComponent({ ref: 'entitiesInput' });
      entitiesInput.vm.$emit('entityEdited', {});
    });

    test('entityEdited event emitted by entitiesInput', () => {
      expect(entitiesInput.emitted('entityEdited')).toBeDefined();
    });
  });

  describe('textInput emit textSelected', () => {
    let textInput;
    const eventValue = { start: 0, end: 3 };

    beforeEach(() => {
      textInput = wrapper.findComponent({ ref: 'textInput' });
      textInput.vm.$emit('textSelected', eventValue);
    });

    test('textSelected event emitted by entitiesInput', () => {
      expect(textInput.emitted('textSelected')).toBeDefined();
    });

    test('textSelected is equal to value emitted by textInput', () => {
      expect(wrapper.vm.textSelected).toMatchObject(eventValue);
    });
  });
});
