import { shallowMount, createLocalVue } from '@vue/test-utils';

import NewExampleForm from '@/components/example/NewExampleForm';
import store from '@/store';
import Buefy from 'buefy';

const localVue = createLocalVue();
localVue.use(Buefy);

describe('NewExampleForm.vue', () => {
  let wrapper;
  beforeEach(() => {
    store.replaceState({
      Auth: {},
    });
    wrapper = shallowMount(NewExampleForm, {
      localVue,
      mocks: {
        $t: () => 'some specific text',
      },
      propsData: {
        repository: {
          uuid: '8511fd26-a3bc-4f74-9af1-176abca5401d',
        },
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
});
