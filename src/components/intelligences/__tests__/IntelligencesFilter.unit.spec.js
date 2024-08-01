import { mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import IntelligencesFilter from '@/components/intelligences/IntelligencesFilter.vue';

const elements = {
  categorySelect: '[data-test="category-select"]',
  nameInput: '[data-test="name-input"]',
  typesSkeletonLoading: '[data-test="types-skeleton-loading"]',
  generativeRadio: '[data-test="generative-radio"]',
  classificationRadio: '[data-test="classification-radio"]',
};

const store = createStore({
  state() {
    return {
      Category: {
        allCategories: [
          { id: 1, name: 'Social', icon: 'social' },
          { id: 2, name: 'Service', icon: 'customer-service' },
          { id: 3, name: 'Configuration', icon: 'config' },
        ],
      },
    };
  },

  actions: {
    getAllCategories: vi.fn(),
  },
});

const setup = ({ category, loadingType, showTypes } = {}) =>
  mount(IntelligencesFilter, {
    props: {
      category,
      loadingType,
      showTypes,
    },

    global: {
      plugins: [store],
    },
  });

describe('IntelligencesFilter.vue', () => {
  let wrapper;

  it('', () => {
    wrapper = setup();
  });

  describe('when category is not set', () => {
    it('should not show the category select', () => {
      wrapper = setup({ category: undefined });

      expect(wrapper.find(elements.categorySelect).exists()).toBeFalsy();
    });
  });

  describe('when category is set', () => {
    it('should show the category select', () => {
      wrapper = setup({ category: [] });

      expect(wrapper.find(elements.categorySelect).exists()).toBeTruthy();
    });

    describe('when the user changes the category', () => {
      it('emits update:category', () => {
        wrapper = setup({ category: [] });

        const categorySelect = wrapper.findComponent(elements.categorySelect);

        categorySelect.vm.$emit('update:modelValue', [
          { value: 2, label: 'Service' },
        ]);

        const updateCategoryEmit = wrapper.emitted('update:category');

        expect(updateCategoryEmit).toHaveLength(1);
        expect(updateCategoryEmit[0]).toEqual([
          [{ value: 2, label: 'Service' }],
        ]);
      });
    });
  });

  describe('when the user changes the name filter', () => {
    it('emits update:name', () => {
      wrapper = setup();

      const nameInput = wrapper.findComponent(elements.nameInput);

      nameInput.vm.$emit('update:modelValue', 'Intelligence Name');

      const updateNameEmit = wrapper.emitted('update:name');

      expect(updateNameEmit).toHaveLength(1);
      expect(updateNameEmit[0]).toEqual(['Intelligence Name']);
    });
  });

  describe('when type is loading', () => {
    it('shows types skeleton loading', () => {
      wrapper = setup({ loadingType: true });

      expect(
        wrapper.findComponent(elements.typesSkeletonLoading).exists(),
      ).toBeTruthy();
    });
  });

  describe('when type is not loading', () => {
    it('shows types skeleton loading', () => {
      wrapper = setup();

      expect(
        wrapper.findComponent(elements.typesSkeletonLoading).exists(),
      ).toBeFalsy();
    });

    it('shows types radios', () => {
      wrapper = setup();

      expect(
        wrapper.findComponent(elements.generativeRadio).exists(),
      ).toBeTruthy();

      expect(
        wrapper.findComponent(elements.classificationRadio).exists(),
      ).toBeTruthy();
    });

    describe.each([
      { radio: elements.generativeRadio, expectedValue: 'generative' },
      { radio: elements.classificationRadio, expectedValue: 'classification' },
    ])(
      'when the user clicks on $expectedValue radio',
      ({ radio, expectedValue }) => {
        it(`emits update:type with value ${expectedValue}`, () => {
          wrapper = setup();

          wrapper.find(radio).trigger('click');

          const updateTypeEmit = wrapper.emitted('update:type');

          expect(updateTypeEmit).toHaveLength(1);
          expect(updateTypeEmit[0]).toEqual([expectedValue]);
        });
      },
    );

    describe('when showType is set to false', () => {
      it('shows types radios', () => {
        wrapper = setup({ showTypes: false });

        expect(
          wrapper.findComponent(elements.generativeRadio).exists(),
        ).toBeFalsy();

        expect(
          wrapper.findComponent(elements.classificationRadio).exists(),
        ).toBeFalsy();
      });
    });
  });
});
